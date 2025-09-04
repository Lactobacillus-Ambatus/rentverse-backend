const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@rentverse.com',
      name: 'Admin User',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const landlord = await prisma.user.create({
    data: {
      email: 'landlord@rentverse.com',
      name: 'John Landlord',
      phone: '+1234567891',
      password: hashedPassword,
      role: 'LANDLORD',
    },
  });

  const tenant = await prisma.user.create({
    data: {
      email: 'tenant@rentverse.com',
      name: 'Jane Tenant',
      phone: '+1234567892',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Beautiful Downtown Apartment',
      description: 'A stunning 2-bedroom apartment in the heart of the city with modern amenities.',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      price: 2500.00,
      type: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      area: 850.5,
      amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Gym'],
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      ownerId: landlord.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Cozy Studio Near Park',
      description: 'A cozy studio apartment perfect for students or young professionals.',
      address: '456 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      price: 1200.00,
      type: 'STUDIO',
      bedrooms: 0,
      bathrooms: 1,
      area: 400.0,
      amenities: ['WiFi', 'Heating', 'Near Public Transport'],
      images: ['https://example.com/studio1.jpg'],
      ownerId: landlord.id,
    },
  });

  // Create a booking
  const booking = await prisma.booking.create({
    data: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalPrice: 30000.00, // 12 months * 2500
      status: 'CONFIRMED',
      notes: 'Long-term rental agreement',
      userId: tenant.id,
      propertyId: property1.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('📊 Created:');
  console.log(`  - ${3} users (Admin, Landlord, Tenant)`);
  console.log(`  - ${2} properties`);
  console.log(`  - ${1} booking`);
  console.log('');
  console.log('🔑 Demo credentials:');
  console.log('  Admin: admin@rentverse.com / password123');
  console.log('  Landlord: landlord@rentverse.com / password123');
  console.log('  Tenant: tenant@rentverse.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
