import type { LoginInput, RegisterInput, User } from '../types/auth';
import httpClient from './httpClient';

export const authService = {
  async register(data: RegisterInput): Promise<User> {
    const res = await httpClient.post<{ user: User }>('/auth/register', data);
    return res.data.user;
  },

  async login(data: LoginInput): Promise<User> {
    const res = await httpClient.post<{ user: User }>('/auth/login', data);
    return res.data.user;
  },

  async me(): Promise<User> {
    const res = await httpClient.get<{ user: User }>('/auth/me');
    return res.data.user;
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  },
};
