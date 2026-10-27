import { toCardDetail, toCardSummary } from '../mappers/response.mapper';
import { attachmentRepository } from '../repositories/attachment.repository';
import { cardRepository } from '../repositories/card.repository';
import { listRepository } from '../repositories/list.repository';
import type { CardUpdateInput } from '../types/card';
import { HttpError } from '../utils/errors';
import { POSITION_STEP } from '../utils/ordering';
import { purgeImages } from './cleanup.service';
import { moveCard as reorderMoveCard } from './reorder.service';

export const cardService = {
  async requireCard(id: number) {
    const card = await cardRepository.findByIdWithBoard(id);
    if (!card) throw new HttpError(404, 'Card not found');
    return card;
  },

  async getCardDetail(id: number) {
    const card = await cardRepository.findById(id);
    if (!card) throw new HttpError(404, 'Card not found');
    return toCardDetail(card);
  },

  async createCard(listId: number, title: string, userId?: number | null) {
    const list = await listRepository.findById(listId);
    if (!list) throw new HttpError(404, 'List not found');
    const last = await cardRepository.findLastByListId(listId);
    const card = await cardRepository.create({
      title,
      listId,
      userId: userId ?? null,
      position: (last?.position ?? 0) + POSITION_STEP,
    });
    return toCardSummary(card);
  },

  async updateCard(id: number, data: CardUpdateInput) {
    await this.requireCard(id);

    if (data.coverAttachmentId) {
      const coverId = data.coverAttachmentId;
      const attachment = await attachmentRepository.findByCardAndId(id, coverId);
      if (!attachment) throw new HttpError(400, 'That image does not belong to this card');
    }

    await cardRepository.update(id, data);
    return this.getCardDetail(id);
  },

  async moveCard(id: number, listId: number, index: number) {
    if (typeof listId !== 'number' || !Number.isInteger(listId)) {
      throw new HttpError(400, 'listId must be a number');
    }
    if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
      throw new HttpError(400, 'index must be a non-negative integer');
    }
    await reorderMoveCard(id, listId, index);
  },

  async deleteCard(id: number, user?: { id: number; name: string; email: string }) {
    const card = await this.requireCard(id);
    if (user) {
      console.log(`[audit] Card "${card.title}" (#${id}) deleted by ${user.name} (${user.email}, id: ${user.id})`);
    }
    await purgeImages({ cardId: id });
    await cardRepository.delete(id);
  },
};
