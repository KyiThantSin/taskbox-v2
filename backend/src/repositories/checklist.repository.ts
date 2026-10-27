import { prisma } from '../db';

export const checklistRepository = {
  async findById(id: number) {
    return prisma.checklistItem.findUnique({ where: { id } });
  },

  async findLastByCardId(cardId: number) {
    return prisma.checklistItem.findFirst({ where: { cardId }, orderBy: { position: 'desc' } });
  },

  async create(data: { text: string; cardId: number; position: number }) {
    return prisma.checklistItem.create({ data });
  },

  async update(id: number, data: { text?: string; done?: boolean }) {
    return prisma.checklistItem.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.checklistItem.delete({ where: { id } });
  },
};
