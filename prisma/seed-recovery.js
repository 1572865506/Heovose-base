const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding superadmin...');
  
  const email = 'admin@heovose.com'; // Default admin email
  const password = 'admin123'; // Default password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'superadmin',
    },
  });

  console.log('Superadmin created/verified:', user);

  // Also seed some basic settings
  await prisma.setting.upsert({
    where: { id: 'languages' },
    update: {},
    create: {
      id: 'languages',
      value: JSON.stringify({
        supportedLanguages: [
          { code: 'zh', label: '中文' },
          { code: 'en', label: 'English' }
        ]
      })
    }
  });

  console.log('Default settings seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
