import crypto from 'crypto';
import { shareRepository } from '../repositories/share.repository';
import { HttpError } from '../utils/errors';
import { dateOnly } from '../utils/format';
import { cardService } from './card.service';

export const shareService = {
  async createOrGetShareToken(cardId: number) {
    const existing = await cardService.requireCard(cardId);
    if (existing.shareToken) {
      return { shareToken: existing.shareToken };
    }
    const token = crypto.randomUUID();
    const updated = await shareRepository.setShareToken(cardId, token);
    return { shareToken: updated.shareToken };
  },

  async revokeShareToken(cardId: number) {
    await cardService.requireCard(cardId);
    await shareRepository.setShareToken(cardId, null);
  },

  async getSharedCard(token: string) {
    const card = await shareRepository.findByShareToken(token);
    if (!card) throw new HttpError(404, 'Shared card not found');

    return {
      title: card.title,
      description: card.description,
      listTitle: card.list.title,
      dueDate: dateOnly(card.dueDate),
      completed: card.completed,
      labels: card.labels.map((l) => ({ name: l.name, style: l.style })),
      checklist: card.checklistItems.map((i) => ({ text: i.text, done: i.done })),
      images: card.attachments.map((a) => ({ url: a.url })),
      coverUrl: card.attachments.find((a) => a.id === card.coverAttachmentId)?.url ?? null,
      createdAt: card.createdAt,
    };
  },
};
