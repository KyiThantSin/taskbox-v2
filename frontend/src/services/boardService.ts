import type { Board, BoardSummary } from '../types/board';
import httpClient from './httpClient';

export const boardService = {
  listBoards: () => httpClient.get<BoardSummary[]>('/boards').then((response) => response.data),
  createBoard: (title: string) => httpClient.post<{ id: number; title: string }>('/boards', { title }).then((response) => response.data),
  getBoard: (id: number) => httpClient.get<Board>(`/boards/${id}`).then((response) => response.data),
  renameBoard: (id: number, title: string) => httpClient.patch<{ id: number; title: string }>(`/boards/${id}`, { title }).then((response) => response.data),
  deleteBoard: (id: number) => httpClient.delete(`/boards/${id}`),
};
