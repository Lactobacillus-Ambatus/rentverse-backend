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
        description: 'Stunning 3-bedroom penthouse with panoramic city views in the heart of Kuala Lumpur.',
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
        description: 'Beautifully renovated 2-bedroom apartment in heritage area with modern amenities.',
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
