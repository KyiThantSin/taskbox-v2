import { toBoard } from '../mappers/response.mapper';
import { boardRepository } from '../repositories/board.repository';
import { HttpError } from '../utils/errors';
import { csvCell, dateOnly } from '../utils/format';
import { POSITION_STEP } from '../utils/ordering';
import { purgeImages } from './cleanup.service';

export const boardService = {
  async getAllBoards() {
    const boards = await boardRepository.findAll();
    return boards.map((b) => ({
      id: b.id,
      title: b.title,
      cardCount: b.lists.reduce((sum, l) => sum + l._count.cards, 0),
    }));
  },

  async createBoard(title: string) {
    const board = await boardRepository.create({
      title,
      lists: {
        create: ['To do', 'Doing', 'Done'].map((t, i) => ({
          title: t,
          position: (i + 1) * POSITION_STEP,
        })),
      },
    });
    return { id: board.id, title: board.title };
  },

  async getBoardById(id: number) {
    const board = await boardRepository.findById(id);
    if (!board) throw new HttpError(404, 'Board not found');
    return toBoard(board);
  },

  async updateBoard(id: number, title: string) {
    const exists = await boardRepository.findRawById(id);
    if (!exists) throw new HttpError(404, 'Board not found');
    const updated = await boardRepository.update(id, title);
    return { id: updated.id, title: updated.title };
  },

  async deleteBoard(id: number) {
    const exists = await boardRepository.findRawById(id);
    if (!exists) throw new HttpError(404, 'Board not found');
    await purgeImages({ card: { list: { boardId: id } } });
    await boardRepository.delete(id);
  },

  async exportBoard(id: number, format: string) {
    if (format !== 'csv') {
      throw new HttpError(400, 'Format must be csv');
    }
    const board = await boardRepository.findForExport(id);
    if (!board) throw new HttpError(404, 'Board not found');

    const rows = board.lists.flatMap((list) =>
      list.cards.map((c) => ({
        list: list.title,
        title: c.title,
        description: c.description,
        dueDate: dateOnly(c.dueDate),
        completed: c.completed,
        labels: c.labels.map((l) => l.name || l.style).join('; '),
        checklist: `${c.checklistItems.filter((i) => i.done).length}/${c.checklistItems.length}`,
        comments: c.comments.length,
        images: c.attachments.map((a) => a.url).join(' '),
        createdAt: c.createdAt.toISOString(),
      })),
    );

    const safeName = board.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'board';
    const filename = `taskbox-${safeName}.${format}`;

    const header = ['list', 'title', 'description', 'dueDate', 'completed', 'labels', 'checklist', 'comments', 'images', 'createdAt'];
    const lines = rows.map((r) => header.map((h) => csvCell(r[h as keyof typeof r])).join(','));
    const csvContent = [header.join(','), ...lines].join('\r\n') + '\r\n';

    return {
      format: 'csv' as const,
      filename,
      data: csvContent,
    };
  },
};
