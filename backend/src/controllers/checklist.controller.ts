import type { NextFunction, Request, Response } from 'express';
import { checklistService } from '../services/checklist.service';
import { HttpError } from '../utils/errors';
import { asObject, parseId, requireText } from '../utils/validation';

export const checklistController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseId(req.params.id, 'card id');
      const text = requireText(asObject(req.body).text, 'Text', 200);
      const card = await checklistService.createItem(cardId, text);
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'item id');
      const { text, done } = req.body || {};
      const data: { text?: string; done?: boolean } = {};

      if (text !== undefined) data.text = requireText(text, 'Text', 200);
      if (done !== undefined) {
        if (typeof done !== 'boolean') throw new HttpError(400, 'done must be true or false');
        data.done = done;
      }

      if (Object.keys(data).length === 0) throw new HttpError(400, 'Nothing to update');

      const card = await checklistService.updateItem(id, data);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'item id');
      const card = await checklistService.deleteItem(id);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },
};
