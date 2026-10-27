import { commentRepository } from '../repositories/comment.repository';
import { HttpError } from '../utils/errors';
import { cardService } from './card.service';

export const commentService = {
  async createComment(cardId: number, body: string, userId?: number | null) {
    await cardService.requireCard(cardId);
    await commentRepository.create({ body, cardId, userId: userId ?? null });
    return cardService.getCardDetail(cardId);
  },

  async deleteComment(id: number) {
    const comment = await commentRepository.findById(id);
    if (!comment) throw new HttpError(404, 'Comment not found');
    await commentRepository.delete(id);
    return cardService.getCardDetail(comment.cardId);
  },
};
