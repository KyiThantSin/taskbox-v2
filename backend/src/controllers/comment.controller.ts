import type { NextFunction, Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { asObject, parseId, requireText } from '../utils/validation';

export const commentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseId(req.params.id, 'card id');
      const body = requireText(asObject(req.body).body, 'Comment', 1000);
      const card = await commentService.createComment(cardId, body, req.user?.id);
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'comment id');
      const card = await commentService.deleteComment(id);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },
};
