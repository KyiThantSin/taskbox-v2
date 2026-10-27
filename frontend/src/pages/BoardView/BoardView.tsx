import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import FilterBar from '../../components/board/FilterBar';
import { ErrorCard } from '../../components/common/ErrorLine';
import Spinner from '../../components/common/Spinner';
import BoardToolbar from '../../components/layout/BoardToolbar';
import { boardService } from '../../services/boardService';
import { listService } from '../../services/listService';
import type { Board, BoardLayout, BoardViewProps, CardFilters } from '../../types/board';
import { cardMatches, countCards, hasFilters, NO_FILTERS, storage } from '../../utils';
import TableView from '../TableView/TableView';
import BoardCanvas from './BoardCanvas';
import { useBoardDnd } from './useBoardDnd';

export default function BoardView({ boardId, onOpenCard, onBoardDeleted }: BoardViewProps) {
  const boardKey = ['board', boardId];
  const { data: board, isPending, isError, refetch } = useQuery<Board>({
    queryKey: boardKey,
    queryFn: () => boardService.getBoard(boardId),
    refetchInterval: 15000,
  });

  const [layout, setLayout] = useState<BoardLayout>(() =>
    storage.get('taskbox.layout') === 'table' ? 'table' : 'board',
  );
  const [filters, setFilters] = useState<CardFilters>(NO_FILTERS);
  const searchRef = useRef<HTMLInputElement>(null);

  const changeLayout = (l: BoardLayout) => {
    setLayout(l);
    storage.set('taskbox.layout', l);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dragEnabled = !hasFilters(filters);
  const dnd = useBoardDnd({ boardKey, dragEnabled });

  const visibleIds = useMemo(() => {
    const ids = new Set<number>();
    board?.lists.forEach((l) => l.cards.forEach((c) => cardMatches(c, filters) && ids.add(c.id)));
    return ids;
  }, [board, filters]);

  if (isPending) return <Spinner label="Loading board…" />;
  if (isError || !board) return <ErrorCard onRetry={() => refetch()} text="Cannot load this board" />;

  const { total, overdue } = countCards(board);
  const filteredCards = board.lists.flatMap((l) => l.cards).filter((c) => visibleIds.has(c.id));

  return (
    <div className="flex flex-col gap-4">
      <BoardToolbar
        boardId={board.id}
        title={board.title}
        cardCount={total}
        overdue={overdue}
        layout={layout}
        onLayout={changeLayout}
        onDeleted={onBoardDeleted}
      />
      <FilterBar filters={filters} onChange={setFilters} labels={board.labels} searchRef={searchRef} />
      {!dragEnabled && layout === 'board' && (
        <p className="font-mono text-xs text-neutral-600">Filters are on: clear them to drag cards and lists.</p>
      )}
      {(dnd.moveCard.isError || dnd.moveList.isError) && (
        <p role="alert" className="border-l-4 border-black pl-2 font-mono text-xs">
          ✕ Could not save the move. The board was restored.
        </p>
      )}

      {layout === 'table' ? (
        <TableView board={board} cards={filteredCards} onOpenCard={onOpenCard} />
      ) : (
        <BoardCanvas
          board={board}
          visibleIds={visibleIds}
          drag={dnd.drag}
          dragEnabled={dragEnabled}
          dropCard={dnd.dropCard}
          dropListIndex={dnd.dropListIndex}
          onOpenCard={onOpenCard}
          onCardDragStart={dnd.onCardDragStart}
          onListDragStart={dnd.onListDragStart}
          onDragEnd={dnd.clearDrag}
          onCardDragOver={dnd.onCardDragOver}
          onCardDrop={dnd.onCardDrop}
          onCardDragLeave={dnd.onCardDragLeave}
          onBoardDragOver={dnd.onBoardDragOver}
          onBoardDrop={dnd.onBoardDrop}
          onAddList={(t) => listService.createList(board.id, t).then(dnd.settle)}
        />
      )}
    </div>
  );
}
