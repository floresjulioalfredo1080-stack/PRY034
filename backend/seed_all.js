const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin' },
    update: { password: adminPassword, role: 'admin' },
    create: {
      name: 'Administrador URBSEND',
      email: 'admin',
      phone: '999888777',
      password: adminPassword,
      role: 'admin'
    }
  });

  const clientPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'cliente@urbsend.com' },
    update: { password: clientPassword, role: 'client' },
    create: {
      name: 'Cliente Ejemplo',
      email: 'cliente@urbsend.com',
      phone: '912345678',
      password: clientPassword,
      role: 'client'
    }
  });

  console.log('SEED_COMPLETED');
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
