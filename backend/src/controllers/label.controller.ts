import type { NextFunction, Request, Response } from 'express';
import { isLabelStyle, labelService, type LabelStyle } from '../services/label.service';
import { HttpError } from '../utils/errors';
import { asObject, parseId } from '../utils/validation';

export const labelController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const boardId = parseId(req.params.id, 'board id');
      const body = asObject(req.body);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length > 30) throw new HttpError(400, 'Label name must be at most 30 characters');
      const style = body.style ?? 'solid';
      if (!isLabelStyle(style)) throw new HttpError(400, `Style must be one of: solid, striped, dotted, outline, gray`);

      const label = await labelService.createLabel(boardId, name, style);
      res.status(201).json(label);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'label id');
      const { name, style } = req.body || {};
      const data: { name?: string; style?: LabelStyle } = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length > 30) {
          throw new HttpError(400, 'Label name must be at most 30 characters');
        }
        data.name = name.trim();
      }
      if (style !== undefined) {
        if (!isLabelStyle(style)) {
          throw new HttpError(400, 'Style must be one of: solid, striped, dotted, outline, gray');
        }
        data.style = style;
      }

      if (Object.keys(data).length === 0) throw new HttpError(400, 'Nothing to update');

      const updated = await labelService.updateLabel(id, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'label id');
      await labelService.deleteLabel(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async addToCard(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseId(req.params.id, 'card id');
      const labelId = parseId(req.params.labelId, 'label id');
      const card = await labelService.addLabelToCard(cardId, labelId);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },

  async removeFromCard(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseId(req.params.id, 'card id');
      const labelId = parseId(req.params.labelId, 'label id');
      const card = await labelService.removeLabelFromCard(cardId, labelId);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },
};
