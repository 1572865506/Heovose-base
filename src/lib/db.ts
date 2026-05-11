import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const db = (globalThis as any).prisma_v2 ?? prismaClientSingleton();
// Prisma Schema Updated: 2026-05-11 11:15
export default db;

if (process.env.NODE_ENV !== 'production') (globalThis as any).prisma_v2 = db;

// Force reload: 1778230570825
// Force reload: 1778460899824