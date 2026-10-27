import type { NextFunction, Request, Response } from 'express';
import { cardService } from '../services/card.service';
import type { CardUpdateInput } from '../types/card';
import { HttpError } from '../utils/errors';
import { asObject, optionalText, parseDueDate, parseId, requireText } from '../utils/validation';

export const cardController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const listId = parseId(req.params.id, 'list id');
      const title = requireText(asObject(req.body).title, 'Title', 120);
      const card = await cardService.createCard(listId, title, req.user?.id);
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      const card = await cardService.getCardDetail(id);
      res.json(card);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      const { title, description, dueDate, completed, coverAttachmentId } = req.body || {};
      const data: CardUpdateInput = {};

      if (title !== undefined) data.title = requireText(title, 'Title', 120);
      if (description !== undefined) data.description = optionalText(description, 'Description', 5000);
      if (dueDate !== undefined) {
        data.dueDate = parseDueDate(dueDate);
        if (data.dueDate === null) data.completed = false;
      }
      if (completed !== undefined) {
        if (typeof completed !== 'boolean') throw new HttpError(400, 'completed must be true or false');
        data.completed = completed;
      }
      if (coverAttachmentId !== undefined) {
        if (coverAttachmentId !== null && (!Number.isInteger(coverAttachmentId) || coverAttachmentId < 1)) {
          throw new HttpError(400, 'coverAttachmentId must be a number or null');
        }
        data.coverAttachmentId = coverAttachmentId;
      }

      if (Object.keys(data).length === 0) throw new HttpError(400, 'Nothing to update');

      const updated = await cardService.updateCard(id, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      const { listId, index } = asObject(req.body);
      await cardService.moveCard(id, listId as number, index as number);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'card id');
      await cardService.deleteCard(id, req.user);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
