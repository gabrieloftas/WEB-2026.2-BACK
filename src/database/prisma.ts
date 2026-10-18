import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
  connectionTimeoutMillis: 5000,
});

export const prisma = new PrismaClient({ adapter });

export async function checkConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    throw new Error(`Falha ao conectar ao banco: ${(err as Error).message}`);
  }
}
