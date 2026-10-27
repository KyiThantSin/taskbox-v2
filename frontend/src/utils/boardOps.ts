import type { Board, CardFilters } from '../types/board';
import type { CardSummary } from '../types/card';
import { dueInfo } from './helpers';

export function applyCardMove(board: Board, cardId: number, listId: number, index: number): Board {
  let moved: CardSummary | undefined;
  const without = board.lists.map((list) => ({
    ...list,
    cards: list.cards.filter((c) => {
      if (c.id === cardId) moved = c;
      return c.id !== cardId;
    }),
  }));
  if (!moved) return board;
  const card = { ...moved, listId };
  return {
    ...board,
    lists: without.map((list) => {
      if (list.id !== listId) return list;
      const cards = [...list.cards];
      cards.splice(Math.max(0, Math.min(index, cards.length)), 0, card);
      return { ...list, cards };
    }),
  };
}

export function applyListMove(board: Board, listId: number, index: number): Board {
  const list = board.lists.find((l) => l.id === listId);
  if (!list) return board;
  const rest = board.lists.filter((l) => l.id !== listId);
  rest.splice(Math.max(0, Math.min(index, rest.length)), 0, list);
  return { ...board, lists: rest };
}

export const NO_FILTERS: CardFilters = { text: '', labelId: null, due: 'any' };
export const hasFilters = (f: CardFilters): boolean => f.text.trim() !== '' || f.labelId !== null || f.due !== 'any';

export function cardMatches(card: CardSummary, f: CardFilters): boolean {
  if (f.text.trim() && !card.title.toLowerCase().includes(f.text.trim().toLowerCase())) return false;
  if (f.labelId !== null && !card.labelIds.includes(f.labelId)) return false;
  if (f.due !== 'any') {
    const due = dueInfo(card.dueDate, card.completed);
    if (f.due === 'none') return due === null;
    if (f.due === 'overdue') return Boolean(due?.overdue);
    if (f.due === 'soon') return Boolean(due?.soon);
  }
  return true;
}

export function countCards(board: Board): { total: number; overdue: number } {
  const cards = board.lists.flatMap((l) => l.cards);
  return { total: cards.length, overdue: cards.filter((c) => dueInfo(c.dueDate, c.completed)?.overdue).length };
}
