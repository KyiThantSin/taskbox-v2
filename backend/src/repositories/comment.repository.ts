import { prisma } from '../db';

export const commentRepository = {
  async findById(id: number) {
    return prisma.comment.findUnique({ where: { id } });
  },

  async create(data: { body: string; cardId: number; userId?: number | null }) {
    return prisma.comment.create({ data });
  },

  async delete(id: number) {
    return prisma.comment.delete({ where: { id } });
  },
};
