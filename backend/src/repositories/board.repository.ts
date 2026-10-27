import { prisma } from '../db';
import { boardInclude } from './queryIncludes';

export const boardRepository = {
  async findAll() {
    return prisma.board.findMany({
      orderBy: { id: 'asc' },
      include: { lists: { select: { _count: { select: { cards: true } } } } },
    });
  },

  async findById(id: number) {
    return prisma.board.findUnique({
      where: { id },
      include: boardInclude,
    });
  },

  async findRawById(id: number) {
    return prisma.board.findUnique({ where: { id } });
  },

  async create(data: { title: string; lists: { create: { title: string; position: number }[] } }) {
    return prisma.board.create({ data });
  },

  async update(id: number, title: string) {
    return prisma.board.update({ where: { id }, data: { title } });
  },

  async delete(id: number) {
    return prisma.board.delete({ where: { id } });
  },

  async findForExport(id: number) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: { labels: true, checklistItems: true, attachments: { select: { url: true } }, comments: true },
            },
          },
        },
      },
    });
  },
};
