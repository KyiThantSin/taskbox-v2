import { prisma } from '../db';

export const listRepository = {
  async findById(id: number) {
    return prisma.list.findUnique({ where: { id } });
  },

  async findLastByBoardId(boardId: number) {
    return prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
  },

  async findByBoardId(boardId: number) {
    return prisma.list.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
  },

  async create(data: { title: string; boardId: number; position: number }) {
    return prisma.list.create({ data });
  },

  async update(id: number, data: { title: string }) {
    return prisma.list.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.list.delete({ where: { id } });
  },

  async updatePositions(updates: { id: number; position: number }[]) {
    return prisma.$transaction(
      updates.map((u) => prisma.list.update({ where: { id: u.id }, data: { position: u.position } }))
    );
  },
};
