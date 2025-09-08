const { prisma } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

const users = [
  {
    email: 'admin@rentverse.com',
    name: 'Admin User',
    phone: '+60123456789',
    role: 'ADMIN',
    isActive: true,
    verifiedAt: new Date()
  },
  {
    email: 'landlord@rentverse.com', 
    name: 'John Landlord',
    phone: '+60123456788',
    role: 'LANDLORD',
    isActive: true,
    verifiedAt: new Date()
  },
  {
    email: 'tenant@rentverse.com',
    name: 'Jane Tenant', 
    phone: '+60123456787',
    role: 'TENANT',
    isActive: true,
    verifiedAt: new Date()
  },
  {
    email: 'landlord2@rentverse.com',
    name: 'Ahmad Rahman',
    phone: '+60987654321',
    role: 'LANDLORD',
    isActive: true,
    verifiedAt: new Date()
  },
  {
    email: 'tenant2@rentverse.com',
    name: 'Siti Aminah',
    phone: '+60987654322',
    role: 'TENANT', 
    isActive: true,
    verifiedAt: new Date()
  },
  {
    email: 'landlord3@rentverse.com',
    name: 'Lim Wei Ming',
    phone: '+60987654323',
    role: 'LANDLORD',
    isActive: true,
    verifiedAt: new Date()
  }
];

async function seedUsers() {
  console.log('👥 Starting users seeding...');

  try {
    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⏭️  User "${userData.email}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        });

        console.log(`✅ Created user: ${user.name} (${user.role}) - ${user.email}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating user "${userData.email}":`, error.message);
      }
    }

    console.log('\n📊 Users Seeding Summary:');
    console.log(`✅ Successfully created: ${createdCount} users`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount} users`);

    // Show user statistics
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      orderBy: { role: 'asc' }
    });

    console.log('\n👥 Users by Role:');
    for (const stat of userStats) {
      console.log(`   ${stat.role}: ${stat._count.id} users`);
    }

    console.log('\n🔑 Demo Credentials (password: password123):');
    for (const user of users) {
      console.log(`   ${user.role}: ${user.email}`);
    }

    return { success: true, created: createdCount };

  } catch (error) {
    console.error('❌ Error during users seeding:', error);
    throw error;
  }
}

// Function to clean up users
async function cleanupUsers() {
  console.log('🧹 Cleaning up existing users...');
  
  try {
    const deleted = await prisma.user.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} users`);
    return deleted.count;
  } catch (error) {
    console.error('❌ Error cleaning up users:', error);
    throw error;
  }
}

module.exports = {
  seedUsers,
  cleanupUsers,
  users
};

// Allow direct execution
if (require.main === module) {
  async function main() {
    try {
      await seedUsers();
    } catch (error) {
      console.error('❌ Users seeding failed:', error);
      process.exit(1);
    }
  }

  main();
}
