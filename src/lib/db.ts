import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();
// console.log('Prisma instance refreshed');

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
