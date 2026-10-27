import type { NextFunction, Request, Response } from 'express';
import { TOKEN_COOKIE_NAME, verifyToken } from '../utils/auth';
import { HttpError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[TOKEN_COOKIE_NAME];
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;

  const token = cookieToken || headerToken;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  authenticate(req, _res, () => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }
    next();
  });
}
