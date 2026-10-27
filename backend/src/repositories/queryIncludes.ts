import type { Prisma } from '@prisma/client';

export const cardSummaryInclude = {
  labels: { select: { id: true } },
  checklistItems: { select: { done: true } },
  attachments: { select: { id: true, url: true }, orderBy: { id: 'asc' } },
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.CardInclude;

export const cardDetailInclude = {
  labels: { select: { id: true } },
  checklistItems: { orderBy: { position: 'asc' } },
  comments: {
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  attachments: { orderBy: { id: 'asc' } },
  user: { select: { id: true, name: true, email: true } },
  list: { select: { id: true, title: true, boardId: true } },
} satisfies Prisma.CardInclude;

export const boardInclude = {
  labels: { orderBy: { id: 'asc' } },
  lists: {
    orderBy: { position: 'asc' },
    include: { cards: { orderBy: { position: 'asc' }, include: cardSummaryInclude } },
  },
} satisfies Prisma.BoardInclude;
