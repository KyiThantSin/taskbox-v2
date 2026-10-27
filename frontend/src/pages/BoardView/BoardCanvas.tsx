import type { BoardCanvasProps } from '../../types/board';

import AddForm from '../../components/board/AddForm';
import ListColumn from '../../components/board/ListColumn';

export default function BoardCanvas({
  board,
  visibleIds,
  drag,
  dragEnabled,
  dropCard,
  dropListIndex,
  onOpenCard,
  onCardDragStart,
  onListDragStart,
  onDragEnd,
  onCardDragOver,
  onCardDrop,
  onCardDragLeave,
  onBoardDragOver,
  onBoardDrop,
  onAddList,
}: BoardCanvasProps) {
  const draggedListId = drag?.type === 'list' ? drag.id : null;
  const columns: JSX.Element[] = [];
  let colSlot = 0;
  const listIndicator = (
    <div key="list-indicator" className="w-1.5 shrink-0 self-stretch rounded-full bg-black" aria-hidden="true" />
  );

  for (const list of board.lists) {
    if (list.id !== draggedListId) {
      if (dropListIndex === colSlot) columns.push(listIndicator);
      colSlot++;
    }
    columns.push(
      <ListColumn
        key={list.id}
        boardId={board.id}
        list={list}
        visibleCards={list.cards.filter((c) => visibleIds.has(c.id))}
        labels={board.labels}
        drag={drag}
        dragEnabled={dragEnabled}
        dropIndex={dropCard?.listId === list.id ? dropCard.index : null}
        onOpenCard={onOpenCard}
        onCardDragStart={onCardDragStart}
        onListDragStart={onListDragStart}
        onDragEnd={onDragEnd}
        onCardDragOver={onCardDragOver}
        onCardDrop={onCardDrop}
        onCardDragLeave={onCardDragLeave}
      />,
    );
  }
  if (dropListIndex !== null && dropListIndex >= colSlot) columns.push(listIndicator);

  return (
    <div
      className="flex min-h-[26rem] items-start gap-4 overflow-x-auto pb-6 pr-4 [height:calc(100vh-19rem)] snap-x"
      onDragOver={onBoardDragOver}
      onDrop={onBoardDrop}
    >
      {columns}
      <div className="w-72 shrink-0 rounded-xl border-2 border-dashed border-black p-2.5">
        <AddForm
          label="Add another list"
          placeholder="List title…"
          maxLength={60}
          onSubmit={onAddList}
        />
      </div>
    </div>
  );
}
