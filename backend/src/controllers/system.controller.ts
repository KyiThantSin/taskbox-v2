import type { NextFunction, Request, Response } from 'express';
import { systemService } from '../services/system.service';

export const systemController = {
  async getHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await systemService.getHealth();
      res.status(health.status === 'ok' ? 200 : 503).json(health);
    } catch (error) {
      next(error);
    }
  },

  async getInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const info = await systemService.getInfo();
      res.json(info);
    } catch (error) {
      next(error);
    }
  },

  getConfig(_req: Request, res: Response) {
    res.json(systemService.getConfig());
  },
};
