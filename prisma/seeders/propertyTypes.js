const { prisma } = require('../../src/config/database');

const propertyTypes = [
  {
    code: 'APARTMENT',
    name: 'Apartment',
    description: 'High-rise residential unit in apartment building',
    isActive: true
  },
  {
    code: 'CONDOMINIUM',
    name: 'Condominium', 
    description: 'Luxury residential unit with premium facilities and amenities',
    isActive: true
  },
  {
    code: 'HOUSE',
    name: 'House',
    description: 'Standalone landed residential property',
    isActive: true
  },
  {
    code: 'TOWNHOUSE',
    name: 'Townhouse',
    description: 'Multi-level landed property in planned development',
    isActive: true
  },
  {
    code: 'STUDIO',
    name: 'Studio',
    description: 'Open-concept single room residential unit',
    isActive: true
  },
  {
    code: 'PENTHOUSE',
    name: 'Penthouse',
    description: 'Luxury apartment on the top floor with premium amenities',
    isActive: true
  },
  {
    code: 'VILLA',
    name: 'Villa',
    description: 'Luxurious single-family home with extensive grounds',
    isActive: true
  }
];

async function seedPropertyTypes() {
  console.log('🏠 Starting property types seeding...');

  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const typeData of propertyTypes) {
      try {
        // Use upsert to handle existing records
        const propertyType = await prisma.propertyType.upsert({
          where: { code: typeData.code },
          update: {
            name: typeData.name,
            description: typeData.description,
            isActive: typeData.isActive
          },
          create: typeData
        });

        if (propertyType) {
          console.log(`✅ Property type: ${propertyType.name} (${propertyType.code})`);
          createdCount++;
        }

      } catch (error) {
        console.error(`❌ Error with property type "${typeData.code}":`, error.message);
      }
    }

    console.log('\n📊 Property Types Seeding Summary:');
    console.log(`✅ Successfully processed: ${createdCount} property types`);

    return { success: true, created: createdCount };

  } catch (error) {
    console.error('❌ Error during property types seeding:', error);
    throw error;
  }
}

// Function to clean up property types
async function cleanupPropertyTypes() {
  console.log('🧹 Cleaning up existing property types...');
  
  try {
    const deleted = await prisma.propertyType.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} property types`);
    return deleted.count;
  } catch (error) {
    console.error('❌ Error cleaning up property types:', error);
    throw error;
  }
}

module.exports = {
  seedPropertyTypes,
  cleanupPropertyTypes,
  propertyTypes
};

// Allow direct execution
if (require.main === module) {
  async function main() {
    try {
      await seedPropertyTypes();
    } catch (error) {
      console.error('❌ Property types seeding failed:', error);
      process.exit(1);
    }
  }

  main();
}
