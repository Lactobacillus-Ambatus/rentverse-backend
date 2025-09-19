const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { getSignatureQRCode } = require('./eSignature.service');
const { prisma } = require('../config/database');
const { uploadToCloudinary } = require('../config/storage');

class PDFGenerationService {
  /**
   * Chrome path detection for macOS/Linux
   */
  getChromePath() {
    if (process.env.CHROME_PATH) {
      return process.env.CHROME_PATH;
    }

    const macChromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    for (const chromePath of macChromePaths) {
      if (fs.existsSync(chromePath)) {
        console.log(`🔍 Found Chrome at: ${chromePath}`);
        return chromePath;
      }
    }

    console.log(
      '⚠️  No Chrome installation found, using Puppeteer bundled Chromium'
    );
    return null;
  }

  /**
   * Generate rental agreement PDF and upload to Cloudinary
   * @param {string} leaseId
   * @returns {Promise<Object>} Cloudinary upload result + RentalAgreement record
   */
  async generateAndUploadRentalAgreementPDF(leaseId) {
    try {
      console.log(
        `🚀 Starting rental agreement PDF generation for lease: ${leaseId}`
      );

      // 1. Get lease data dengan relasi lengkap
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
          property: {
            include: {
              propertyType: true,
              amenities: {
                include: {
                  amenity: true,
                },
              },
            },
          },
          tenant: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
              phone: true,
            },
          },
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      if (!lease) {
        throw new Error(`Lease with ID ${leaseId} not found`);
      }

      console.log(
        `📋 Retrieved lease data for property: ${lease.property.title}`
      );

      // 2. Generate QR codes for signatures
      console.log('📝 Generating e-signature QR codes...');

      const landlordSignData = {
        name: lease.landlord.name,
        timestamp: new Date().toISOString(),
        leaseId: lease.id,
        role: 'landlord',
      };

      const tenantSignData = {
        name: lease.tenant.name,
        timestamp: new Date().toISOString(),
        leaseId: lease.id,
        role: 'tenant',
      };

      const [landlordQRCode, tenantQRCode] = await Promise.all([
        getSignatureQRCode(landlordSignData),
        getSignatureQRCode(tenantSignData),
      ]);

      console.log('✅ QR codes generated successfully');

      // 3. Prepare data untuk template EJS
      const templateData = {
        rentalAgreement: {
          id: `RA-${lease.id.slice(-8).toUpperCase()}-${new Date().getFullYear()}`,
        },
        lease: lease,
        signatures: {
          landlord: {
            qrCode: landlordQRCode,
            signDate: new Date().toLocaleDateString('id-ID'),
            name: lease.landlord.name,
          },
          tenant: {
            qrCode: tenantQRCode,
            signDate: new Date().toLocaleDateString('id-ID'),
            name: lease.tenant.name,
          },
        },
      };

      // 4. Read dan render EJS template
      const templatePath = path.join(
        __dirname,
        '../../templates/rental-agreement.ejs'
      );
      console.log('📖 Reading template from:', templatePath);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      console.log('⚡ Rendering EJS template...');
      const html = ejs.render(templateContent, templateData);

      // 5. Generate PDF menggunakan Puppeteer
      console.log('🌐 Launching browser for PDF generation...');

      const chromePath = this.getChromePath();
      const launchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      };

      if (chromePath) {
        launchOptions.executablePath = chromePath;
      }

      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('📄 Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
        preferCSSPageSize: true,
      });

      await browser.close();
      console.log(
        `✅ PDF generated successfully! Size: ${Math.round(pdfBuffer.length / 1024)} KB`
      );

      // 6. Upload PDF ke Cloudinary
      console.log('☁️  Uploading PDF to Cloudinary...');
      const fileName = `rental-agreement-${lease.id}-${Date.now()}`;
      const uploadResult = await uploadToCloudinary(
        {
          buffer: pdfBuffer,
          mimetype: 'application/pdf',
          originalname: `${fileName}.pdf`,
          size: pdfBuffer.length,
        },
        {
          folder: 'rental-agreements',
          resource_type: 'raw', // Important for PDF files
          public_id: fileName,
          format: 'pdf',
        }
      );

      console.log('✅ PDF uploaded to Cloudinary successfully!');
      console.log('📍 Cloudinary URL:', uploadResult.secure_url);

      // 7. Simpan record RentalAgreement ke database
      console.log('💾 Saving rental agreement record to database...');
      const rentalAgreement = await prisma.rentalAgreement.create({
        data: {
          leaseId: lease.id,
          pdfUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: `${fileName}.pdf`,
          fileSize: pdfBuffer.length,
        },
      });

      console.log('✅ Rental agreement record saved to database');

      return {
        success: true,
        message: 'Rental agreement PDF generated and uploaded successfully',
        data: {
          rentalAgreement,
          cloudinary: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileName: `${fileName}.pdf`,
            size: pdfBuffer.length,
            etag: uploadResult.etag,
          },
        },
      };
    } catch (error) {
      console.error('❌ Error generating rental agreement PDF:', error.message);
      throw new Error(
        `Failed to generate rental agreement PDF: ${error.message}`
      );
    }
  }

  /**
   * Get rental agreement PDF for a lease
   * @param {string} leaseId
   * @returns {Promise<Object>}
   */
  async getRentalAgreementPDF(leaseId) {
    try {
      const rentalAgreement = await prisma.rentalAgreement.findUnique({
        where: { leaseId },
        include: {
          lease: {
            include: {
              property: {
                select: { id: true, title: true },
              },
              tenant: {
                select: { id: true, name: true, email: true },
              },
              landlord: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!rentalAgreement) {
        throw new Error('Rental agreement not found for this lease');
      }

      return {
        success: true,
        data: rentalAgreement,
      };
    } catch (error) {
      throw new Error(`Failed to get rental agreement: ${error.message}`);
    }
  }

  /**
   * Check if rental agreement already exists for a lease
   * @param {string} leaseId
   * @returns {Promise<boolean>}
   */
  async rentalAgreementExists(leaseId) {
    const existing = await prisma.rentalAgreement.findUnique({
      where: { leaseId },
    });
    return !!existing;
  }
}

module.exports = new PDFGenerationService();
