const {
  s3Client,
  STORAGE_BUCKET,
  STORAGE_URL,
  isS3Configured,
} = require('../config/s3');
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

class FileUploadService {
  constructor() {
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
    this.allowedImageTypes = (
      process.env.ALLOWED_IMAGE_TYPES ||
      'image/jpeg,image/jpg,image/png,image/webp'
    ).split(',');
    this.allowedFileTypes = (
      process.env.ALLOWED_FILE_TYPES ||
      'image/jpeg,image/jpg,image/png,image/webp,application/pdf'
    ).split(',');
  }

  /**
   * Check if S3 is configured
   */
  checkS3Config() {
    if (!isS3Configured) {
      throw new Error(
        'S3 storage is not configured. Please check your environment variables.'
      );
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file, allowedTypes = null) {
    const types = allowedTypes || this.allowedFileTypes;

    if (!types.includes(file.mimetype)) {
      throw new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${types.join(', ')}`
      );
    }

    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size ${file.size} exceeds maximum allowed size ${this.maxFileSize} bytes`
      );
    }

    return true;
  }

  /**
   * Generate unique filename
   */
  generateFileName(originalName, folder = '') {
    const extension = originalName.split('.').pop();
    const uniqueName = `${uuidv4()}.${extension}`;
    return folder ? `${folder}/${uniqueName}` : uniqueName;
  }

  /**
   * Optimize image before upload
   */
  async optimizeImage(buffer, options = {}) {
    try {
      const {
        width = 1920,
        height = 1080,
        quality = 80,
        format = 'jpeg',
      } = options;

      let transformer = sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      switch (format) {
        case 'png':
          transformer = transformer.png({ quality });
          break;
        case 'webp':
          transformer = transformer.webp({ quality });
          break;
        case 'jpeg':
        case 'jpg':
          transformer = transformer.jpeg({ quality });
          break;
        default:
          transformer = transformer.jpeg({ quality }); // fallback to jpeg
          break;
      }
      const optimized = await transformer.toBuffer();

      return optimized;
    } catch (error) {
      console.error('Image optimization error:', error);
      return buffer; // Return original if optimization fails
    }
  }

  /**
   * Upload file to S3-compatible storage
   */
  async uploadFile(file, folder = 'general', optimize = true) {
    try {
      // Check if S3 is configured
      this.checkS3Config();

      // Validate file
      this.validateFile(file, this.allowedFileTypes);

      // Generate unique filename
      const fileName = this.generateFileName(file.originalname, folder);

      let fileBuffer = file.buffer;

      // Optimize image if it's an image file and optimization is enabled
      if (optimize && this.allowedImageTypes.includes(file.mimetype)) {
        fileBuffer = await this.optimizeImage(fileBuffer);
      }

      // Upload to S3 Storage
      const command = new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.mimetype,
      });

      const result = await s3Client.send(command);

      // Return file info
      return {
        fileName: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${STORAGE_URL}/${fileName}`,
        bucket: STORAGE_BUCKET,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, folder = 'general', optimize = true) {
    try {
      const uploadPromises = files.map(file =>
        this.uploadFile(file, folder, optimize)
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3 Storage
   */
  async deleteFile(fileName) {
    try {
      this.checkS3Config();

      const command = new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: fileName,
      });

      await s3Client.send(command);

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(fileNames) {
    try {
      this.checkS3Config();

      const deletePromises = fileNames.map(fileName => {
        const command = new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: fileName,
        });
        return s3Client.send(command);
      });

      await Promise.all(deletePromises);

      return { success: true, message: 'Files deleted successfully' };
    } catch (error) {
      console.error('Multiple file delete error:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(fileName) {
    return `${STORAGE_URL}/${fileName}`;
  }

  /**
   * Create thumbnail for image
   */
  async createThumbnail(file, folder = 'thumbnails') {
    try {
      this.checkS3Config();
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new Error('File is not an image');
      }

      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 70 })
        .toBuffer();

      // Generate filename for thumbnail
      const thumbnailFileName = this.generateFileName(
        file.originalname,
        folder
      );

      // Upload thumbnail to S3
      const command = new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: thumbnailFileName,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      });

      const result = await s3Client.send(command);

      return {
        fileName: thumbnailFileName,
        url: `${STORAGE_URL}/${thumbnailFileName}`,
        size: thumbnailBuffer.length,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
