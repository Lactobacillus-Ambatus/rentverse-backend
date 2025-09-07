const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const penangProjects = [
  {
    name: "Penang Pearl City",
    developer: "IJM Land Berhad",
    description: "Premium mixed development featuring high-rise residential towers, commercial spaces, and lifestyle amenities in the heart of George Town. Pearl City offers modern urban living with easy access to heritage sites and business districts.",
    address: "Jalan Burma, George Town",
    city: "George Town", 
    state: "Penang",
    country: "MY",
    postalCode: "10050",
    placeId: "ChIJ0T2NLikRzDERKxE8d61aX_E",
    latitude: 5.4141,
    longitude: 100.3288,
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultSizeSqm: 1200.0,
    defaultPrice: 850000.00,
    defaultAmenities: ["Swimming Pool", "Gymnasium", "24-Hour Security", "Covered Parking", "Children's Playground", "BBQ Area"],
    sampleDataUrl: "https://www.ijmland.com/penang-pearl-city"
  },
  {
    name: "Gurney Paragon",
    developer: "Hunza Properties Berhad",
    description: "Luxury residential development located at the prestigious Gurney Drive. Features premium serviced apartments with panoramic sea views and integrated shopping mall with international retail brands.",
    address: "163A, Persiaran Gurney",
    city: "George Town",
    state: "Penang", 
    country: "MY",
    postalCode: "10250",
    placeId: "ChIJIXeXKysRzDERpKxE8d61bYE",
    latitude: 5.4378,
    longitude: 100.3114,
    defaultBedrooms: 4,
    defaultBathrooms: 3,
    defaultSizeSqm: 1800.0,
    defaultPrice: 1200000.00,
    defaultAmenities: ["Infinity Pool", "Sky Gymnasium", "Concierge Service", "Valet Parking", "Private Lift Lobby", "Rooftop Garden"],
    sampleDataUrl: "https://www.hunzaproperties.com/gurney-paragon"
  },
  {
    name: "The Light Collection",
    developer: "CapitaLand Malaysia",
    description: "Integrated waterfront development comprising residential towers, office spaces, retail mall, and hotel. Located at the vibrant Gelugor area with excellent connectivity to Penang Bridge and city center.",
    address: "Jalan Gelugor",
    city: "Gelugor",
    state: "Penang",
    country: "MY", 
    postalCode: "11700",
    placeId: "ChIJ7xkRKjgRzDERmNxE8d61cXF",
    latitude: 5.3560,
    longitude: 100.3065,
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultSizeSqm: 1100.0,
    defaultPrice: 750000.00,
    defaultAmenities: ["Swimming Pool", "Fitness Center", "Retail Mall", "Food Court", "Covered Parking", "Shuttle Service"],
    sampleDataUrl: "https://www.capitaland.com.my/the-light-collection"
  },
  {
    name: "Penang World City",
    developer: "Genting Berhad",
    description: "Mega integrated development on reclaimed land featuring residential units, commercial spaces, convention center, and theme park. One of the largest mixed developments in Northern Malaysia.",
    address: "Persiaran Karpal Singh",
    city: "Bayan Lepas",
    state: "Penang",
    country: "MY",
    postalCode: "11900", 
    placeId: "ChIJMxgRPjkRzDERoOxE8d61dYH",
    latitude: 5.3307,
    longitude: 100.2463,
    defaultBedrooms: 2,
    defaultBathrooms: 2,
    defaultSizeSqm: 950.0,
    defaultPrice: 650000.00,
    defaultAmenities: ["Theme Park Access", "Convention Center", "Shopping Mall", "Food & Beverage", "Entertainment Hub", "Public Transport"],
    sampleDataUrl: "https://www.genting.com.my/penang-world-city"
  },
  {
    name: "Tropicana Metropark",
    developer: "Tropicana Corporation Berhad",
    description: "Comprehensive township development featuring landed and high-rise properties with integrated lifestyle amenities. Located in Subang Jaya with excellent accessibility to KL and major highways.",
    address: "Persiaran Tropicana",
    city: "Subang Jaya",
    state: "Selangor",
    country: "MY",
    postalCode: "47500",
    placeId: "ChIJLxgRKykRzDERlNxE8d61bXG",
    latitude: 3.0735,
    longitude: 101.5851,
    defaultBedrooms: 3,
    defaultBathrooms: 3,
    defaultSizeSqm: 1350.0,
    defaultPrice: 920000.00,
    defaultAmenities: ["Township Mall", "Medical Center", "International School", "Golf Course", "Parks & Recreation", "Public Transport Hub"],
    sampleDataUrl: "https://www.tropicana.com.my/metropark"
  },
  {
    name: "Setia Sky Residences", 
    developer: "S P Setia Berhad",
    description: "Premium sky residences offering luxury living with stunning city and sea views. Features state-of-the-art facilities and strategic location in KL Sentral with direct LRT access.",
    address: "Jalan Stesen Sentral 2",
    city: "Kuala Lumpur",
    state: "Kuala Lumpur",
    country: "MY",
    postalCode: "50470",
    placeId: "ChIJPxgRMzgRzDERnOxE8d61eYI",
    latitude: 3.1335,
    longitude: 101.6869,
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultSizeSqm: 1250.0,
    defaultPrice: 1100000.00,
    defaultAmenities: ["Sky Pool", "Sky Gymnasium", "Sky Lounge", "Concierge", "LRT Access", "Premium Parking"],
    sampleDataUrl: "https://www.spsetia.com.my/setia-sky-residences"
  },
  {
    name: "Bukit Bintang City Centre",
    developer: "UEM Sunrise Berhad", 
    description: "Iconic mixed development in the heart of Kuala Lumpur's golden triangle. Comprises luxury residences, Grade A offices, premium retail spaces, and 5-star hotel.",
    address: "Jalan Hang Tuah",
    city: "Kuala Lumpur",
    state: "Kuala Lumpur", 
    country: "MY",
    postalCode: "55100",
    placeId: "ChIJSxgRLzgRzDERmOxE8d61fYJ",
    latitude: 3.1478,
    longitude: 101.7089,
    defaultBedrooms: 2,
    defaultBathrooms: 2,
    defaultSizeSqm: 900.0,
    defaultPrice: 980000.00,
    defaultAmenities: ["Luxury Mall", "5-Star Hotel", "Rooftop Pool", "Sky Bridge", "Valet Service", "Monorail Access"],
    sampleDataUrl: "https://www.uemsunrise.com.my/bbcc"
  },
  {
    name: "Cyberjaya City Centre",
    developer: "Setia Haruman Sdn Bhd",
    description: "Smart city development featuring eco-friendly residential and commercial spaces with advanced digital infrastructure. Located in Malaysia's Silicon Valley with proximity to tech companies.",
    address: "Persiaran Multimedia",
    city: "Cyberjaya",
    state: "Selangor",
    country: "MY",
    postalCode: "63000",
    placeId: "ChIJUxgRNzgRzDERpOxE8d61gYK",
    latitude: 2.9213,
    longitude: 101.6559,
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultSizeSqm: 1150.0,
    defaultPrice: 720000.00,
    defaultAmenities: ["Smart Home Technology", "Fiber Internet", "Co-working Spaces", "Electric Car Charging", "Green Building", "Shuttle Service"],
    sampleDataUrl: "https://www.cyberjaya-city-centre.com.my"
  },
  {
    name: "Iskandar Puteri Central",
    developer: "UEM Land Berhad",
    description: "Master-planned city development featuring integrated residential, commercial, and educational facilities. Strategic location near Singapore border with excellent growth potential.",
    address: "Persiaran Medini",
    city: "Iskandar Puteri",
    state: "Johor",
    country: "MY",
    postalCode: "79200",
    placeId: "ChIJVxgROzgRzDERqOxE8d61hYL",
    latitude: 1.4331,
    longitude: 103.6622,
    defaultBedrooms: 4,
    defaultBathrooms: 3,
    defaultSizeSqm: 1600.0,
    defaultPrice: 850000.00,
    defaultAmenities: ["Theme Parks", "Premium Outlets", "International Schools", "Medical Hub", "Golf Courses", "Marina"],
    sampleDataUrl: "https://www.uemland.com.my/iskandar-puteri"
  },
  {
    name: "Kota Kinabalu City Centre",
    developer: "Sutera Harbour Resort",
    description: "Waterfront development offering luxury residences with marina access and resort-style amenities. Features panoramic views of South China Sea and Mount Kinabalu.",
    address: "Jalan Sutera",
    city: "Kota Kinabalu", 
    state: "Sabah",
    country: "MY",
    postalCode: "88100",
    placeId: "ChIJWxgRPzgRzDERrOxE8d61iYM",
    latitude: 5.9804,
    longitude: 116.0735,
    defaultBedrooms: 3,
    defaultBathrooms: 2,
    defaultSizeSqm: 1300.0,
    defaultPrice: 680000.00,
    defaultAmenities: ["Marina Access", "Beach Club", "Golf Course", "Spa & Wellness", "Yacht Club", "Water Sports"],
    sampleDataUrl: "https://www.suteraharbour.com.my"
  }
];

async function seedPenangProjects() {
  console.log('🌱 Starting to seed Penang and Malaysia projects...');

  try {
    // Get existing property types instead of creating new ones
    const apartmentType = await prisma.propertyType.findUnique({
      where: { code: 'APARTMENT' }
    });

    const condominiumType = await prisma.propertyType.findUnique({
      where: { code: 'CONDOMINIUM' }
    });

    const townhouseType = await prisma.propertyType.findUnique({
      where: { code: 'TOWNHOUSE' }
    });

    if (!apartmentType || !condominiumType || !townhouseType) {
      throw new Error('Property types not found. Please run property types seeder first.');
    }

    // Assign property types to projects based on their characteristics
    const projectsWithTypes = penangProjects.map((project, index) => {
      let defaultPropertyTypeId;
      
      // Assign property types based on project characteristics
      if (project.name.includes('Pearl City') || project.name.includes('Paragon') || project.name.includes('Sky')) {
        defaultPropertyTypeId = condominiumType.id; // Luxury projects
      } else if (project.name.includes('Metropark') || project.name.includes('Centre')) {
        defaultPropertyTypeId = townhouseType.id; // Township developments
      } else {
        defaultPropertyTypeId = apartmentType.id; // Standard apartments
      }

      return {
        ...project,
        defaultPropertyTypeId
      };
    });

    // Create projects one by one with proper error handling
    let createdCount = 0;
    let skippedCount = 0;

    for (const projectData of projectsWithTypes) {
      try {
        // Check if project already exists
        const existingProject = await prisma.project.findFirst({
          where: { name: projectData.name }
        });

        if (existingProject) {
          console.log(`⏭️  Project "${projectData.name}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const project = await prisma.project.create({
          data: projectData,
          include: {
            defaultPropertyType: true
          }
        });

        console.log(`✅ Created project: ${project.name} in ${project.city}, ${project.state}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating project "${projectData.name}":`, error.message);
      }
    }

    console.log('\n📊 Project Seeding Summary:');
    console.log(`✅ Successfully created: ${createdCount} projects`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount} projects`);
    console.log(`🎯 Total processed: ${penangProjects.length} projects`);

    // Display some statistics
    const totalProjects = await prisma.project.count();
    const projectsByState = await prisma.project.groupBy({
      by: ['state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    console.log('\n📈 Current Database Statistics:');
    console.log(`🏢 Total projects in database: ${totalProjects}`);
    console.log('🗺️  Projects by state:');
    
    for (const stateData of projectsByState) {
      console.log(`   ${stateData.state}: ${stateData._count.id} projects`);
    }

    console.log('\n🎉 Penang and Malaysia projects seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during project seeding:', error);
    throw error;
  }
}

// Function to clean up projects (useful for testing)
async function cleanupProjects() {
  console.log('🧹 Cleaning up existing projects...');
  
  try {
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`🗑️  Deleted ${deletedProjects.count} projects`);
  } catch (error) {
    console.error('❌ Error cleaning up projects:', error);
    throw error;
  }
}

// Export functions for use in main seed file or standalone execution
module.exports = {
  seedPenangProjects,
  cleanupProjects,
  penangProjects
};

// Allow direct execution of this seeder
if (require.main === module) {
  async function main() {
    try {
      await seedPenangProjects();
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  main();
}
