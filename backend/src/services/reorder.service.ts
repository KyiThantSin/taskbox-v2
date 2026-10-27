import { cardRepository } from '../repositories/card.repository';
import { listRepository } from '../repositories/list.repository';
import { HttpError } from '../utils/errors';
import { POSITION_STEP, insertAt } from '../utils/ordering';

const positionFor = (i: number): number => (i + 1) * POSITION_STEP;

export async function moveList(listId: number, index: number): Promise<void> {
  const list = await listRepository.findById(listId);
  if (!list) throw new HttpError(404, 'List not found');

  const siblings = await listRepository.findByBoardId(list.boardId);
  const order = insertAt(
    siblings.map((s) => s.id),
    listId,
    index,
  );
  await listRepository.updatePositions(order.map((id, i) => ({ id, position: positionFor(i) })));
}

export async function moveCard(cardId: number, targetListId: number, index: number): Promise<void> {
  const card = await cardRepository.findById(cardId);
  if (!card) throw new HttpError(404, 'Card not found');
  const target = await listRepository.findById(targetListId);
  if (!target) throw new HttpError(404, 'List not found');
  if (target.boardId !== card.list.boardId) throw new HttpError(400, 'A card cannot move to another board');

  const siblings = await cardRepository.findByListId(targetListId);
  const order = insertAt(
    siblings.map((s) => s.id),
    cardId,
    index,
  );
  await cardRepository.updatePositions(
    order.map((id, i) => ({ id, listId: targetListId, position: positionFor(i) }))
  );
}
