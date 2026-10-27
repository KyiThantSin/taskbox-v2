// convert database records into API response objects.
import type { Prisma } from '@prisma/client';
import { boardInclude, cardDetailInclude, cardSummaryInclude } from '../repositories/queryIncludes';
import { dateOnly } from '../utils/format';

export type CardSummaryRow = Prisma.CardGetPayload<{ include: typeof cardSummaryInclude }>;

export function toCardSummary(card: CardSummaryRow) {
  return {
    id: card.id,
    listId: card.listId,
    title: card.title,
    position: card.position,
    dueDate: dateOnly(card.dueDate),
    completed: card.completed,
    labelIds: card.labels.map((l) => l.id),
    checklist: { total: card.checklistItems.length, done: card.checklistItems.filter((i) => i.done).length },
    attachmentCount: card.attachments.length,
    commentCount: card._count.comments,
    hasDescription: Boolean(card.description),
    coverUrl: card.attachments.find((a) => a.id === card.coverAttachmentId)?.url ?? null,
    shared: card.shareToken !== null,
    author: card.user ? { id: card.user.id, name: card.user.name } : null,
  };
}

export type CardDetailRow = Prisma.CardGetPayload<{ include: typeof cardDetailInclude }>;

export function toCardDetail(card: CardDetailRow) {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    listId: card.listId,
    listTitle: card.list.title,
    boardId: card.list.boardId,
    dueDate: dateOnly(card.dueDate),
    completed: card.completed,
    labelIds: card.labels.map((l) => l.id),
    coverAttachmentId: card.coverAttachmentId,
    shareToken: card.shareToken,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    checklistItems: card.checklistItems.map((i) => ({ id: i.id, text: i.text, done: i.done })),
    comments: card.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email } : null,
    })),
    attachments: card.attachments.map((a) => ({ id: a.id, url: a.url, fileName: a.fileName, createdAt: a.createdAt })),
    author: card.user ? { id: card.user.id, name: card.user.name, email: card.user.email } : null,
  };
}

// board with its lists and card summaries
export type BoardRow = Prisma.BoardGetPayload<{ include: typeof boardInclude }>;

export function toBoard(board: BoardRow) {
  return {
    id: board.id,
    title: board.title,
    labels: board.labels.map((l) => ({ id: l.id, name: l.name, style: l.style })),
    lists: board.lists.map((list) => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: list.cards.map(toCardSummary),
    })),
  };
}
