import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    if (!process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("DATABASE_URL is not defined in the environment.");
        }
        console.warn("DATABASE_URL is not defined. Prisma Client might fail to initialize.");
    }

    const client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
}
