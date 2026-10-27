import type { NextFunction, Request, Response } from 'express';
import { attachmentService } from '../services/attachment.service';
import { parseId } from '../utils/validation';

export const attachmentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseId(req.params.id, 'card id');
      const card = await attachmentService.uploadAttachment(cardId, req.file);
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'attachment id');
      const card = await attachmentService.deleteAttachment(id);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },
};
