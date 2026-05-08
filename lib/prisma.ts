import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

export function canConnectToDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrismaClient(): PrismaClient {
  if (!canConnectToDatabase()) {
    throw new Error("DATABASE_URL is not configured. Set DATABASE_URL or disable server submission.");
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma ??= new PrismaClient();
    return globalForPrisma.prisma;
  }

  return new PrismaClient();
}
