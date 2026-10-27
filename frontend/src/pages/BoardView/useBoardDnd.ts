import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DragEvent } from 'react';
import { useState } from 'react';
import { cardService } from '../../services/cardService';
import { listService } from '../../services/listService';
import type { Board, BoardMutationContext, BoardTransform, CardDropTarget, Drag, DragKind, MoveCardInput, UseBoardDndOptions } from '../../types/board';
import { applyCardMove, applyListMove } from '../../utils';

export function useBoardDnd({ boardKey, dragEnabled }: UseBoardDndOptions) {
  const queryClient = useQueryClient();
  const [drag, setDrag] = useState<Drag>(null);
  const [dropCard, setDropCard] = useState<CardDropTarget | null>(null);
  const [dropListIndex, setDropListIndex] = useState<number | null>(null);

  const clearDrag = () => {
    setDrag(null);
    setDropCard(null);
    setDropListIndex(null);
  };

  const optimistic = (change: BoardTransform) => async () => {
    await queryClient.cancelQueries({ queryKey: boardKey });
    const previous = queryClient.getQueryData<Board>(boardKey);
    if (previous) queryClient.setQueryData<Board>(boardKey, change(previous));
    return { previous };
  };
  const rollback = (ctx?: BoardMutationContext) =>
    ctx?.previous && queryClient.setQueryData(boardKey, ctx.previous);
  const settle = () => queryClient.invalidateQueries({ queryKey: boardKey });

  const moveCard = useMutation({
    mutationFn: (v: MoveCardInput) =>
      cardService.moveCard(v.cardId, v.listId, v.index),
    onMutate: (v) => optimistic((b) => applyCardMove(b, v.cardId, v.listId, v.index))(),
    onError: (_e, _v, ctx) => rollback(ctx),
    onSettled: settle,
  });

  const moveList = useMutation({
    mutationFn: (v: CardDropTarget) => listService.moveList(v.listId, v.index),
    onMutate: (v) => optimistic((b) => applyListMove(b, v.listId, v.index))(),
    onError: (_e, _v, ctx) => rollback(ctx),
    onSettled: settle,
  });

  const startDrag = (type: DragKind, id: number, e: DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${type}:${id}`);
    setDrag({ type, id });
  };

  const onCardDragStart = (e: DragEvent<HTMLElement>, id: number) => {
    if (!dragEnabled) return e.preventDefault();
    startDrag('card', id, e);
  };

  const onListDragStart = (e: DragEvent<HTMLElement>, id: number) => {
    if (!dragEnabled) return e.preventDefault();
    const column = e.currentTarget.closest<HTMLElement>('[data-list-id]');
    if (column) e.dataTransfer.setDragImage(column, 24, 24);
    startDrag('list', id, e);
  };

  const onCardDragOver = (e: DragEvent<HTMLElement>, listId: number) => {
    if (drag?.type !== 'card') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const tiles = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-card-id]')).filter(
      (el) => Number(el.dataset.cardId) !== drag.id,
    );
    let index = 0;
    for (const el of tiles) {
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top + r.height / 2) index++;
      else break;
    }
    if (dropCard?.listId !== listId || dropCard.index !== index) setDropCard({ listId, index });
  };

  const onCardDrop = (e: DragEvent<HTMLElement>, listId: number) => {
    if (drag?.type !== 'card') return;
    e.preventDefault();
    const index = dropCard?.listId === listId ? dropCard.index : 0;
    moveCard.mutate({ cardId: drag.id, listId, index });
    clearDrag();
  };

  const onCardDragLeave = (e: DragEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropCard(null);
  };

  const onBoardDragOver = (e: DragEvent<HTMLElement>) => {
    if (drag?.type !== 'list') return;
    e.preventDefault();
    const cols = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-list-id]')).filter(
      (el) => Number(el.dataset.listId) !== drag.id,
    );
    let index = 0;
    for (const el of cols) {
      const r = el.getBoundingClientRect();
      if (e.clientX > r.left + r.width / 2) index++;
      else break;
    }
    if (dropListIndex !== index) setDropListIndex(index);
  };

  const onBoardDrop = (e: DragEvent<HTMLElement>) => {
    if (drag?.type !== 'list') return;
    e.preventDefault();
    moveList.mutate({ listId: drag.id, index: dropListIndex ?? 0 });
    clearDrag();
  };

  return {
    drag,
    dropCard,
    dropListIndex,
    moveCard,
    moveList,
    clearDrag,
    settle,
    onCardDragStart,
    onListDragStart,
    onCardDragOver,
    onCardDrop,
    onCardDragLeave,
    onBoardDragOver,
    onBoardDrop,
  };
}
