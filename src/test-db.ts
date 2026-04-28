import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://heovose:heovose_password@127.0.0.1:5432/heovose_elevate?schema=public"
    }
  }
});
async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.map(u => u.email));
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
