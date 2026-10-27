import type { CardDetail } from '../types/card';
import httpClient from './httpClient';

export const commentService = {
  addComment: (cardId: number, body: string) =>
    httpClient.post<CardDetail>(`/cards/${cardId}/comments`, { body }).then((response) => response.data),
  deleteComment: (id: number) =>
    httpClient.delete<CardDetail>(`/comments/${id}`).then((response) => response.data),
};
