import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const id = 'PSL_PROD_AIO_0504_987C_1_0';
  const result = await prisma.localizedString.findFirst({
    where: {
      id: {
        equals: id,
        mode: 'insensitive' // 不区分大小写查找
      }
    }
  });
  console.log('Real ID in DB:', result?.id);
  console.log('Content keys:', result ? Object.keys(result.content as any) : 'Not found');
  console.log('Full content:', JSON.stringify(result?.content, null, 2));
  await prisma.$disconnect();
}

main();
