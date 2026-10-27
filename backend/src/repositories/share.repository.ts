import { prisma } from '../db';

export const shareRepository = {
  async findByShareToken(token: string) {
    return prisma.card.findUnique({
      where: { shareToken: token },
      include: {
        list: { select: { title: true } },
        labels: { orderBy: { id: 'asc' } },
        checklistItems: { orderBy: { position: 'asc' } },
        attachments: { orderBy: { id: 'asc' } },
      },
    });
  },

  async setShareToken(cardId: number, shareToken: string | null) {
    return prisma.card.update({
      where: { id: cardId },
      data: { shareToken },
      include: { list: { select: { boardId: true } } },
    });
  },
};
