import { boardRepository } from '../repositories/board.repository';
import { cardRepository } from '../repositories/card.repository';
import { labelRepository } from '../repositories/label.repository';
import { HttpError } from '../utils/errors';
import { cardService } from './card.service';

export const LABEL_STYLES = ['solid', 'striped', 'dotted', 'outline', 'gray'] as const;
export type LabelStyle = (typeof LABEL_STYLES)[number];
export const isLabelStyle = (v: unknown): v is LabelStyle => LABEL_STYLES.includes(v as LabelStyle);

export const labelService = {
  async createLabel(boardId: number, name: string, style: LabelStyle) {
    const board = await boardRepository.findRawById(boardId);
    if (!board) throw new HttpError(404, 'Board not found');
    const label = await labelRepository.create({ name, style, boardId });
    return { id: label.id, name: label.name, style: label.style };
  },

  async updateLabel(id: number, data: { name?: string; style?: LabelStyle }) {
    const exists = await labelRepository.findById(id);
    if (!exists) throw new HttpError(404, 'Label not found');
    const updated = await labelRepository.update(id, data);
    return { id: updated.id, name: updated.name, style: updated.style };
  },

  async deleteLabel(id: number) {
    const exists = await labelRepository.findById(id);
    if (!exists) throw new HttpError(404, 'Label not found');
    await labelRepository.delete(id);
  },

  async addLabelToCard(cardId: number, labelId: number) {
    const card = await cardService.requireCard(cardId);
    const label = await labelRepository.findById(labelId);
    if (!label) throw new HttpError(404, 'Label not found');
    if (label.boardId !== card.list.boardId) throw new HttpError(400, 'Label belongs to another board');

    await cardRepository.addLabel(cardId, labelId);
    return cardService.getCardDetail(cardId);
  },

  async removeLabelFromCard(cardId: number, labelId: number) {
    await cardService.requireCard(cardId);
    await cardRepository.removeLabel(cardId, labelId);
    return cardService.getCardDetail(cardId);
  },
};
