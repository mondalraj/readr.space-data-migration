import { PrismaClient } from '@prisma/client';

// Create a global instance of Prisma client to avoid multiple instances in development
// See: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client

// Add prisma to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || new PrismaClient();

// In development, we'll keep the prisma instance across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
