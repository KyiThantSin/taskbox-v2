import { checklistRepository } from '../repositories/checklist.repository';
import { HttpError } from '../utils/errors';
import { POSITION_STEP } from '../utils/ordering';
import { cardService } from './card.service';

export const checklistService = {
  async createItem(cardId: number, text: string) {
    await cardService.requireCard(cardId);
    const last = await checklistRepository.findLastByCardId(cardId);
    await checklistRepository.create({
      text,
      cardId,
      position: (last?.position ?? 0) + POSITION_STEP,
    });
    return cardService.getCardDetail(cardId);
  },

  async updateItem(id: number, data: { text?: string; done?: boolean }) {
    const item = await checklistRepository.findById(id);
    if (!item) throw new HttpError(404, 'Checklist item not found');
    await checklistRepository.update(id, data);
    return cardService.getCardDetail(item.cardId);
  },

  async deleteItem(id: number) {
    const item = await checklistRepository.findById(id);
    if (!item) throw new HttpError(404, 'Checklist item not found');
    await checklistRepository.delete(id);
    return cardService.getCardDetail(item.cardId);
  },
};
