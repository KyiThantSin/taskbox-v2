import { prisma } from '../db';
import type { CardUpdateInput } from '../types/card';
import { cardDetailInclude, cardSummaryInclude } from './queryIncludes';

export const cardRepository = {
  async findById(id: number) {
    return prisma.card.findUnique({
      where: { id },
      include: cardDetailInclude,
    });
  },

  async findRawById(id: number) {
    return prisma.card.findUnique({ where: { id } });
  },

  async findByIdWithBoard(id: number) {
    return prisma.card.findUnique({
      where: { id },
      include: { list: { select: { boardId: true } } },
    });
  },

  async findLastByListId(listId: number) {
    return prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
    });
  },

  async findByListId(listId: number) {
    return prisma.card.findMany({
      where: { listId },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
  },

  async create(data: { title: string; listId: number; position: number; userId?: number | null }) {
    return prisma.card.create({
      data,
      include: cardSummaryInclude,
    });
  },

  async update(id: number, data: CardUpdateInput) {
    return prisma.card.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.card.delete({ where: { id } });
  },

  async count() {
    return prisma.card.count();
  },

  async updatePositions(updates: { id: number; listId: number; position: number }[]) {
    return prisma.$transaction(
      updates.map((u) =>
        prisma.card.update({
          where: { id: u.id },
          data: { listId: u.listId, position: u.position },
        })
      )
    );
  },

  async addLabel(cardId: number, labelId: number) {
    return prisma.card.update({
      where: { id: cardId },
      data: { labels: { connect: { id: labelId } } },
    });
  },

  async removeLabel(cardId: number, labelId: number) {
    return prisma.card.update({
      where: { id: cardId },
      data: { labels: { disconnect: { id: labelId } } },
    });
  },
};
