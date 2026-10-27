import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AUTH_COOKIE_OPTIONS, TOKEN_COOKIE_NAME } from '../utils/auth';
import { HttpError } from '../utils/errors';
import { asObject, requireText } from '../utils/validation';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = asObject(req.body);
      const email = requireText(body.email, 'Email', 120);
      const name = requireText(body.name, 'Name', 60);
      const password = requireText(body.password, 'Password', 100);

      // Check email format.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpError(400, 'Invalid email address format');
      }

      const { user, token } = await authService.register(email, name, password);
      res.cookie(TOKEN_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = asObject(req.body);
      const email = requireText(body.email, 'Email', 120);
      const password = requireText(body.password, 'Password', 100);

      const { user, token } = await authService.login(email, password);
      res.cookie(TOKEN_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Not authenticated');
      }
      const user = await authService.getProfile(req.user.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(TOKEN_COOKIE_NAME, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 0,
      });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },
};
