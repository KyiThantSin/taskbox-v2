import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForDb(maxAttempts = 30, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[db] connected (attempt ${attempt})`);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message.split('\n').pop() : String(err);
      console.log(`[db] not ready (attempt ${attempt}/${maxAttempts}): ${message}`);
      await sleep(delayMs);
    }
  }
  throw new Error('Database never became ready');
}
