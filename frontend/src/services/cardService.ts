import type { CardDetail, CardPatch, CardSummary } from '../types/card';
import httpClient from './httpClient';

export const cardService = {
  createCard: (listId: number, title: string) =>
    httpClient.post<CardSummary>(`/lists/${listId}/cards`, { title }).then((response) => response.data),
  getCard: (id: number) => httpClient.get<CardDetail>(`/cards/${id}`).then((response) => response.data),
  patchCard: (id: number, patch: CardPatch) =>
    httpClient.patch<CardDetail>(`/cards/${id}`, patch).then((response) => response.data),
  moveCard: (id: number, listId: number, index: number) =>
    httpClient.post(`/cards/${id}/move`, { listId, index }),
  deleteCard: (id: number) => httpClient.delete(`/cards/${id}`),
};
