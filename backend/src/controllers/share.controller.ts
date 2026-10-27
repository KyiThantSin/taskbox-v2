import type { NextFunction, Request, Response } from 'express';
import { shareService } from '../services/share.service';
import { parseId } from '../utils/validation';

export const shareController = {
  async createToken(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      const result = await shareService.createOrGetShareToken(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async revokeToken(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      await shareService.revokeShareToken(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async getShared(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await shareService.getSharedCard(req.params.token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
