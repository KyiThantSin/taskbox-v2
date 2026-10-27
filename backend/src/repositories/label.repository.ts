import { prisma } from '../db';

export const labelRepository = {
  async findById(id: number) {
    return prisma.label.findUnique({ where: { id } });
  },

  async create(data: { name: string; style: string; boardId: number }) {
    return prisma.label.create({ data });
  },

  async update(id: number, data: { name?: string; style?: string }) {
    return prisma.label.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.label.delete({ where: { id } });
  },
};
