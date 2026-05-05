import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const setting = await prisma.setting.findUnique({
    where: { id: 'languages' }
  });
  console.log(setting?.value);
  await prisma.$disconnect();
}

main();
