import { boardRepository } from '../repositories/board.repository';
import { listRepository } from '../repositories/list.repository';
import { HttpError } from '../utils/errors';
import { POSITION_STEP } from '../utils/ordering';
import { purgeImages } from './cleanup.service';
import { moveList as reorderMoveList } from './reorder.service';

export const listService = {
  async createList(boardId: number, title: string) {
    const board = await boardRepository.findRawById(boardId);
    if (!board) throw new HttpError(404, 'Board not found');
    const last = await listRepository.findLastByBoardId(boardId);
    const list = await listRepository.create({
      title,
      boardId,
      position: (last?.position ?? 0) + POSITION_STEP,
    });
    return { id: list.id, title: list.title, position: list.position, cards: [] };
  },

  async updateList(id: number, title: string) {
    const exists = await listRepository.findById(id);
    if (!exists) throw new HttpError(404, 'List not found');
    const updated = await listRepository.update(id, { title });
    return { id: updated.id, title: updated.title };
  },

  async moveList(id: number, index: number) {
    if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
      throw new HttpError(400, 'index must be a non-negative integer');
    }
    await reorderMoveList(id, index);
  },

  async deleteList(id: number) {
    const exists = await listRepository.findById(id);
    if (!exists) throw new HttpError(404, 'List not found');
    await purgeImages({ card: { listId: id } });
    await listRepository.delete(id);
  },
};
