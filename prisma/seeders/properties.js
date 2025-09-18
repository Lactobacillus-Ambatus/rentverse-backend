const { prisma } = require('../../src/config/database');

async function seedProperties() {
  console.log('🏠 Starting properties seeding...');

  try {
    // Get required data first
    const landlord = await prisma.user.findFirst({
      where: { role: 'LANDLORD' }
    });

    if (!landlord) {
      throw new Error('No landlord found. Please run users seeder first.');
    }

    const apartmentType = await prisma.propertyType.findUnique({
      where: { code: 'APARTMENT' }
    });

    const condominiumType = await prisma.propertyType.findUnique({
      where: { code: 'CONDOMINIUM' }
    });

    if (!apartmentType || !condominiumType) {
      throw new Error('Property types not found. Please run property types seeder first.');
    }

    // Get some amenities
    const amenities = await prisma.amenity.findMany({
      where: {
        name: {
          in: ['Air Conditioning', 'Swimming Pool', 'Covered Parking', 'Gymnasium', '24-Hour Security']
        }
      }
    });

    // Sample properties data
    const properties = [
      {
        title: 'Luxury Penthouse at KLCC',
        description: 'Stunning 3-bedroom penthouse with panoramic city views in the heart of Kuala Lumpur. Features marble flooring, high-end appliances, and private elevator access.',
        address: 'Jalan Ampang, KLCC',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        zipCode: '50088',
        price: 8500.00,
        bedrooms: 3,
        bathrooms: 3,
        areaSqm: 180.0,
        code: 'PROP-KLCC-001',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 3.1578,
        longitude: 101.7118,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1560449752-6bb5e20a4e36?w=800'
        ]
      },
      {
        title: 'Modern Apartment in George Town',
        description: 'Beautifully renovated 2-bedroom apartment in heritage area with modern amenities. Walking distance to UNESCO World Heritage sites and local eateries.',
        address: 'Lebuh Armenian, George Town',
        city: 'George Town',
        state: 'Penang',
        zipCode: '10200',
        price: 2200.00,
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 95.0,
        code: 'PROP-PG-002',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 5.4164,
        longitude: 100.3327,
        ownerId: landlord.id,
        propertyTypeId: apartmentType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
        ]
      },
      {
        title: 'Cozy Studio at Mont Kiara',
        description: 'Perfect for young professionals. Fully furnished studio apartment with modern amenities, gym, and swimming pool access.',
        address: 'Jalan Kiara, Mont Kiara',
        city: 'Kuala Lumpur',
        state: 'Selangor',
        zipCode: '50480',
        price: 1800.00,
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 45.0,
        code: 'PROP-MK-003',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 3.1725,
        longitude: 101.6520,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1631889993959-41b4e9b69dde?w=800'
        ]
      },
      {
        title: 'Spacious Family Home in Subang Jaya',
        description: '4-bedroom double-storey terrace house perfect for families. Near schools, shopping malls, and public transport.',
        address: 'SS15/4, Subang Jaya',
        city: 'Subang Jaya',
        state: 'Selangor',
        zipCode: '47500',
        price: 3200.00,
        bedrooms: 4,
        bathrooms: 3,
        areaSqm: 220.0,
        code: 'PROP-SJ-004',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: false,
        latitude: 3.0436,
        longitude: 101.5870,
        ownerId: landlord.id,
        propertyTypeId: apartmentType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ]
      },
      {
        title: 'Beachfront Condo in Gurney Bay',
        description: 'Wake up to stunning sea views every morning! 2-bedroom beachfront condominium with direct beach access and resort-style facilities.',
        address: 'Persiaran Gurney, Gurney Bay',
        city: 'George Town',
        state: 'Penang',
        zipCode: '10250',
        price: 4500.00,
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 120.0,
        code: 'PROP-GB-005',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 5.4370,
        longitude: 100.3090,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
        ]
      },
      {
        title: 'Executive Apartment in Bangsar',
        description: 'Premium 3-bedroom apartment in exclusive Bangsar area. Close to embassies, international schools, and trendy cafes.',
        address: 'Jalan Bangsar, Bangsar',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        zipCode: '59000',
        price: 5200.00,
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 140.0,
        code: 'PROP-BS-006',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 3.1319,
        longitude: 101.6841,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ]
      },
      {
        title: 'Budget-Friendly Room in Puchong',
        description: 'Affordable single room in shared apartment. Perfect for students and young working adults. Includes utilities and WiFi.',
        address: 'Jalan Puchong, Puchong',
        city: 'Puchong',
        state: 'Selangor',
        zipCode: '47100',
        price: 650.00,
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 25.0,
        code: 'PROP-PC-007',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 3.0269,
        longitude: 101.6050,
        ownerId: landlord.id,
        propertyTypeId: apartmentType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
        ]
      },
      {
        title: 'Luxury Villa in Damansara Heights',
        description: 'Exclusive 5-bedroom villa with private pool and garden. Premium location with 24-hour security and panoramic city views.',
        address: 'Jalan Semantan, Damansara Heights',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        zipCode: '50490',
        price: 12000.00,
        bedrooms: 5,
        bathrooms: 4,
        areaSqm: 350.0,
        code: 'PROP-DH-008',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 3.1516,
        longitude: 101.6650,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ]
      },
      {
        title: 'Serviced Apartment in Cyberjaya',
        description: 'Modern 2-bedroom serviced apartment in tech hub Cyberjaya. High-speed internet, gym, and business center facilities.',
        address: 'Persiaran APEC, Cyberjaya',
        city: 'Cyberjaya',
        state: 'Selangor',
        zipCode: '63000',
        price: 2800.00,
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 85.0,
        code: 'PROP-CJ-009',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: true,
        latitude: 2.9213,
        longitude: 101.6559,
        ownerId: landlord.id,
        propertyTypeId: condominiumType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ]
      },
      {
        title: 'Historic Shophouse in Malacca',
        description: 'Beautifully restored 3-story shophouse in UNESCO World Heritage area. Perfect for Airbnb or boutique business.',
        address: 'Jalan Hang Jebat, Malacca',
        city: 'Malacca',
        state: 'Malacca',
        zipCode: '75200',
        price: 3500.00,
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 160.0,
        code: 'PROP-ML-010',
        country: 'MY',
        currencyCode: 'MYR',
        furnished: false,
        latitude: 2.1951,
        longitude: 102.2501,
        ownerId: landlord.id,
        propertyTypeId: apartmentType.id,
        status: 'APPROVED',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ]
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const propertyData of properties) {
      try {
        // Check if property already exists
        const existingProperty = await prisma.property.findUnique({
          where: { code: propertyData.code }
        });

        if (existingProperty) {
          console.log(`⏭️  Property "${propertyData.code}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const property = await prisma.property.create({
          data: propertyData,
          include: {
            propertyType: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        // Add some amenities to the property
        if (amenities.length > 0) {
          const propertyAmenities = amenities.slice(0, 3).map(amenity => ({
            propertyId: property.id,
            amenityId: amenity.id
          }));

          await prisma.propertyAmenity.createMany({
            data: propertyAmenities,
            skipDuplicates: true
          });
        }

        console.log(`✅ Created property: ${property.title} in ${property.city}, ${property.state}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating property "${propertyData.title}":`, error.message);
      }
    }

    console.log('\n📊 Properties Seeding Summary:');
    console.log(`✅ Successfully created: ${createdCount} properties`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount} properties`);

    // Show property statistics
    const totalProperties = await prisma.property.count();
    const propertiesByState = await prisma.property.groupBy({
      by: ['state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    console.log('\n🏠 Properties Statistics:');
    console.log(`   Total properties: ${totalProperties}`);
    console.log('   Properties by state:');
    
    for (const stateData of propertiesByState) {
      console.log(`     ${stateData.state}: ${stateData._count.id} properties`);
    }

    return { success: true, created: createdCount };

  } catch (error) {
    console.error('❌ Error during properties seeding:', error);
    throw error;
  }
}

// Function to clean up properties
async function cleanupProperties() {
  console.log('🧹 Cleaning up existing properties...');
  
  try {
    // Delete property amenities first due to foreign key constraints
    await prisma.propertyAmenity.deleteMany({});
    
    // Then delete properties
    const deleted = await prisma.property.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} properties`);
    return deleted.count;
  } catch (error) {
    console.error('❌ Error cleaning up properties:', error);
    throw error;
  }
}

module.exports = {
  seedProperties,
  cleanupProperties
};

// Allow direct execution
if (require.main === module) {
  async function main() {
    try {
      await seedProperties();
    } catch (error) {
      console.error('❌ Properties seeding failed:', error);
      process.exit(1);
    }
  }

  main();
}
