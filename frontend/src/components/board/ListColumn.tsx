import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { cardService } from '../../services/cardService';
import { listService } from '../../services/listService';
import type { ListColumnProps } from '../../types/board';
import CardTile from '../card/CardTile';
import { useConfirm } from '../common/ConfirmModal';
import ErrorLine from '../common/ErrorLine';
import AddForm from './AddForm';

export default function ListColumn(props: ListColumnProps) {
  const { boardId, list, visibleCards, labels, drag, dragEnabled, dropIndex } = props;
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    queryClient.invalidateQueries({ queryKey: ['boards'] });
  };

  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(list.title);

  const rename = useMutation({ mutationFn: (t: string) => listService.renameList(list.id, t), onSuccess: () => { setRenaming(false); refresh(); } });
  const remove = useMutation({ mutationFn: () => listService.deleteList(list.id), onSuccess: refresh });

  const submitRename = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === list.title) return setRenaming(false);
    rename.mutate(title.trim());
  };

  const confirm = useConfirm();

  const onDelete = async () => {
    const n = list.cards.length;
    const msg = n > 0 ? `Delete the list "${list.title}" and its ${n} card${n === 1 ? '' : 's'}? This cannot be undone.` : `Delete the list "${list.title}"?`;
    const ok = await confirm({
      title: 'Delete list',
      message: msg,
      confirmText: 'Delete list',
      isDestructive: true,
    });
    if (ok) remove.mutate();
  };

  const indicator = <div key="drop-indicator" className="mb-3 h-1.5 rounded-full bg-black" aria-hidden="true" />;
  const draggedCardId = drag?.type === 'card' ? drag.id : null;
  const items: JSX.Element[] = [];
  let slot = 0;
  for (const card of visibleCards) {
    const isDragged = card.id === draggedCardId;
    if (!isDragged) {
      if (dropIndex === slot) items.push(indicator);
      slot++;
    }
    items.push(
      <CardTile
        key={card.id}
        card={card}
        labels={labels}
        dragging={isDragged}
        onOpen={props.onOpenCard}
        onDragStart={props.onCardDragStart}
        onDragEnd={props.onDragEnd}
      />,
    );
  }
  if (dropIndex !== null && dropIndex >= slot) items.push(indicator);

  return (
    <section
      data-list-id={list.id}
      aria-label={`List ${list.title}`}
      className={`flex max-h-full w-72 shrink-0 flex-col rounded-xl border-2 border-black bg-neutral-100 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] ${
        drag?.type === 'list' && drag.id === list.id ? 'opacity-40' : ''
      }`}
    >
      <header className="flex items-center gap-1 border-b-2 border-black px-2 py-2">
        <span
          draggable={dragEnabled}
          onDragStart={(e) => props.onListDragStart(e, list.id)}
          onDragEnd={props.onDragEnd}
          className={`rounded p-0.5 ${dragEnabled ? 'cursor-grab hover:bg-neutral-200 active:cursor-grabbing' : 'opacity-30'}`}
          title={dragEnabled ? 'Drag to reorder lists' : 'Clear filters to reorder'}
        >
          <GripVertical size={16} aria-label="Drag list" />
        </span>

        {renaming ? (
          <form onSubmit={submitRename} className="min-w-0 flex-1">
            <input
              autoFocus
              className="input py-1 text-sm font-bold"
              value={title}
              maxLength={60}
              aria-label="List title"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => e.key === 'Escape' && setRenaming(false)}
            />
          </form>
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-sm font-black uppercase tracking-wide hover:bg-neutral-200"
            onClick={() => {
              setTitle(list.title);
              setRenaming(true);
            }}
            title="Click to rename"
          >
            {list.title}
          </button>
        )}

        <span className="rounded-full border-2 border-black bg-white px-1.5 font-mono text-[11px] font-bold">{list.cards.length}</span>
        <button type="button" className="rounded p-1 hover:bg-neutral-200" onClick={onDelete} aria-label={`Delete list ${list.title}`} title="Delete list">
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </header>

      <div
        className="flex min-h-[3rem] flex-1 flex-col overflow-y-auto p-2.5"
        onDragOver={(e) => props.onCardDragOver(e, list.id)}
        onDrop={(e) => props.onCardDrop(e, list.id)}
        onDragLeave={(e) => props.onCardDragLeave(e, list.id)}
      >
        {items}
        {visibleCards.length === 0 && dropIndex === null && (
          <p className="py-3 text-center font-mono text-xs text-neutral-500">No cards</p>
        )}
      </div>

      <footer className="border-t-2 border-black p-2">
        {(rename.isError || remove.isError) && <ErrorLine error={rename.error ?? remove.error} />}
        <AddForm
          label="Add a card"
          placeholder="Card title…"
          maxLength={120}
          onSubmit={(text) => cardService.createCard(list.id, text).then(refresh)}
        />
      </footer>
    </section>
  );
}
