import type { NextFunction, Request, Response } from 'express';
import { boardService } from '../services/board.service';
import { asObject, parseId, requireText } from '../utils/validation';

export const boardController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const boards = await boardService.getAllBoards();
      res.json(boards);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const title = requireText(asObject(req.body).title, 'Title', 60);
      const board = await boardService.createBoard(title);
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'board id');
      const board = await boardService.getBoardById(id);
      res.json(board);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'board id');
      const title = requireText(asObject(req.body).title, 'Title', 60);
      const board = await boardService.updateBoard(id, title);
      res.json(board);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'board id');
      await boardService.deleteBoard(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id, 'board id');
      const format = String(req.query.format ?? 'csv');
      const result = await boardService.exportBoard(id, format);

      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.type('text/csv').send(result.data);
    } catch (error) {
      next(error);
    }
  },
};
