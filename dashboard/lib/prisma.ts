import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'path';

// Load environment variables from .env.local or .env
loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

