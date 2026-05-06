import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();
// Prisma Schema Updated: 2026-05-06 16:32
export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
