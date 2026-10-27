import type { ListWithCards } from '../types/board';
import httpClient from './httpClient';

export const listService = {
  createList: (boardId: number, title: string) =>
    httpClient.post<ListWithCards>(`/boards/${boardId}/lists`, { title }).then((response) => response.data),
  renameList: (id: number, title: string) => httpClient.patch(`/lists/${id}`, { title }),
  moveList: (id: number, index: number) => httpClient.post(`/lists/${id}/move`, { index }),
  deleteList: (id: number) => httpClient.delete(`/lists/${id}`),
};
