import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { HttpError } from '../utils/errors';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const isLimit = err.code === 'LIMIT_FILE_SIZE';
    res.status(isLimit ? 413 : 400).json({
      error: isLimit ? 'Image file is too large (max 5 MB)' : err.message,
    });
    return;
  }

  if (err.status || err.statusCode) {
    res.status(err.status || err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[api] error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
