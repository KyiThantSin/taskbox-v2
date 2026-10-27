import { prisma } from '../db';

export const systemRepository = {
  ping: () => prisma.$queryRaw`SELECT 1`,
};
