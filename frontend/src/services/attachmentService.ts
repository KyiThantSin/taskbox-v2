import type { CardDetail } from '../types/card';
import httpClient from './httpClient';

export const attachmentService = {
  uploadImage: (cardId: number, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return httpClient
      .post<CardDetail>(`/cards/${cardId}/attachments`, form, { timeout: 60000 })
      .then((response) => response.data);
  },
  deleteAttachment: (id: number) =>
    httpClient.delete<CardDetail>(`/attachments/${id}`).then((response) => response.data),
};
