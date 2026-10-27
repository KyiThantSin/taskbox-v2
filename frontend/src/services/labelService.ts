import type { CardDetail } from '../types/card';
import type { Label, LabelPatch, LabelStyle } from '../types/label';
import httpClient from './httpClient';

export const labelService = {
  createLabel: (boardId: number, name: string, style: LabelStyle) =>
    httpClient.post<Label>(`/boards/${boardId}/labels`, { name, style }).then((response) => response.data),
  updateLabel: (id: number, patch: LabelPatch) =>
    httpClient.patch<Label>(`/labels/${id}`, patch).then((response) => response.data),
  deleteLabel: (id: number) => httpClient.delete(`/labels/${id}`),
  setCardLabel: (cardId: number, labelId: number, on: boolean) =>
    (on
      ? httpClient.put<CardDetail>(`/cards/${cardId}/labels/${labelId}`)
      : httpClient.delete<CardDetail>(`/cards/${cardId}/labels/${labelId}`)
    ).then((response) => response.data),
};
