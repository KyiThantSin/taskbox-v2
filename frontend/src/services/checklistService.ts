import type { CardDetail, ChecklistPatch } from '../types/card';
import httpClient from './httpClient';

export const checklistService = {
  addChecklistItem: (cardId: number, text: string) =>
    httpClient.post<CardDetail>(`/cards/${cardId}/checklist`, { text }).then((response) => response.data),
  patchChecklistItem: (id: number, patch: ChecklistPatch) =>
    httpClient.patch<CardDetail>(`/checklist/${id}`, patch).then((response) => response.data),
  deleteChecklistItem: (id: number) =>
    httpClient.delete<CardDetail>(`/checklist/${id}`).then((response) => response.data),
};
