import type { Prisma } from '@prisma/client';
import { prisma } from '../db';

export const attachmentRepository = {
  async findById(id: number) {
    return prisma.attachment.findUnique({ where: { id } });
  },

  async countByCardId(cardId: number) {
    return prisma.attachment.count({ where: { cardId } });
  },

  async create(data: { cardId: number; url: string; publicId: string; fileName: string }) {
    return prisma.attachment.create({ data });
  },

  async delete(id: number) {
    return prisma.attachment.delete({ where: { id } });
  },

  async clearCardCoverIfMatching(cardId: number, attachmentId: number) {
    return prisma.card.updateMany({
      where: { id: cardId, coverAttachmentId: attachmentId },
      data: { coverAttachmentId: null },
    });
  },

  async setCardCover(cardId: number, attachmentId: number) {
    return prisma.card.update({
      where: { id: cardId },
      data: { coverAttachmentId: attachmentId },
    });
  },

  async findByCardAndId(cardId: number, attachmentId: number) {
    return prisma.attachment.findFirst({
      where: { id: attachmentId, cardId },
    });
  },

  async findManyByWhere(where: Prisma.AttachmentWhereInput) {
    return prisma.attachment.findMany({ where, select: { publicId: true } });
  },
};
