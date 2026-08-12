const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const driver = await prisma.driver.upsert({
    where: { email: 'julio@urbsend.com' },
    update: {
      name: 'Julio',
      password: hashedPassword,
      isVerified: true,
      isOnline: true,
      latitude: -16.4100,
      longitude: -71.5350
    },
    create: {
      name: 'Julio',
      email: 'julio@urbsend.com',
      phone: '987654321',
      password: hashedPassword,
      vehicleType: 'moto',
      vehiclePlate: 'JUL-123',
      vehicleBrand: 'Honda',
      vehicleModel: 'CB 125',
      vehicleYear: 2023,
      isVerified: true,
      isOnline: true,
      latitude: -16.4100,
      longitude: -71.5350
    }
  });
  console.log('DRIVER_CREATED_SUCCESSFULLY:', JSON.stringify(driver));
}

main()
  .catch((err) => {
    console.error('ERROR_CREATING_DRIVER:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
