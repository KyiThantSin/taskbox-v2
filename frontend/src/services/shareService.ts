import type { SharedCard } from '../types/card';
import httpClient from './httpClient';

export const shareService = {
  getSharedCard: (token: string) =>
    httpClient.get<SharedCard>(`/shared/${encodeURIComponent(token)}`).then((response) => response.data),

  share: (cardId: number) =>
    httpClient.post<{ shareToken: string }>(`/cards/${cardId}/share`).then((response) => response.data),
  unshare: (cardId: number) => httpClient.delete(`/cards/${cardId}/share`),
};
