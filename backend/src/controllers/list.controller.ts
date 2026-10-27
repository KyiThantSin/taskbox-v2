import type { NextFunction, Request, Response } from 'express';
import { listService } from '../services/list.service';
import { asObject, parseId, requireText } from '../utils/validation';

export const listController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const boardId = parseId(req.params.id, 'board id');
      const title = requireText(asObject(req.body).title, 'Title', 60);
      const list = await listService.createList(boardId, title);
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'list id');
      const title = requireText(asObject(req.body).title, 'Title', 60);
      const list = await listService.updateList(id, title);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'list id');
      const { index } = asObject(req.body);
      await listService.moveList(id, index as number);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'list id');
      await listService.deleteList(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
