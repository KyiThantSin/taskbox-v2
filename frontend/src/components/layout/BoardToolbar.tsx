import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FileSpreadsheet, Kanban, Table2, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { boardService } from '../../services/boardService';
import type { BoardToolbarProps } from '../../types/board';
import { useConfirm } from '../common/ConfirmModal';
import ErrorLine from '../common/ErrorLine';

export default function BoardToolbar({ boardId, title, cardCount, overdue, layout, onLayout, onDeleted }: BoardToolbarProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    queryClient.invalidateQueries({ queryKey: ['boards'] });
  };
  const rename = useMutation({ mutationFn: (t: string) => boardService.renameBoard(boardId, t), onSuccess: () => { setEditing(false); refresh(); } });
  const remove = useMutation({
    mutationFn: () => boardService.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onDeleted();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || draft.trim() === title) return setEditing(false);
    rename.mutate(draft.trim());
  };

  const confirm = useConfirm();

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete board',
      message: `Delete the board "${title}" with all its lists, cards and images? This cannot be undone.`,
      confirmText: 'Delete board',
      isDestructive: true,
    });
    if (ok) remove.mutate();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        {editing ? (
          <form onSubmit={submit}>
            <input
              autoFocus
              className="input py-1 text-2xl font-black tracking-tight"
              value={draft}
              maxLength={60}
              aria-label="Board title"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
            />
          </form>
        ) : (
          <h2 className="truncate text-2xl font-black tracking-tight">
            <button
              type="button"
              className="rounded px-1 hover:bg-neutral-200"
              onClick={() => {
                setDraft(title);
                setEditing(true);
              }}
              title="Click to rename"
            >
              {title}
            </button>
          </h2>
        )}
        <p className="mt-0.5 flex items-center gap-3 px-1 font-mono text-xs text-neutral-600">
          <span>{cardCount} card{cardCount === 1 ? '' : 's'}</span>
          {overdue > 0 && (
            <span className="inline-flex items-center gap-1 font-bold text-black">
              <AlertTriangle size={12} aria-hidden="true" /> {overdue} overdue
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Layout" className="inline-flex overflow-hidden rounded-lg border-2 border-black">
          {(
            [
              ['board', 'Board', Kanban],
              ['table', 'Table', Table2],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              aria-pressed={layout === key}
              onClick={() => onLayout(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold ${layout === key ? 'bg-black text-white' : 'bg-white hover:bg-neutral-100'}`}
            >
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        <a className="btn-alt btn-sm" href={`/api/boards/${boardId}/export?format=csv`} download>
          <FileSpreadsheet size={14} aria-hidden="true" /> CSV
        </a>
        <button type="button" className="btn-alt btn-sm" onClick={onDelete} disabled={remove.isPending}>
          <Trash2 size={14} aria-hidden="true" /> Delete board
        </button>
      </div>
      {(rename.isError || remove.isError) && (
        <div className="w-full">
          <ErrorLine error={rename.error ?? remove.error} />
        </div>
      )}
    </div>
  );
}
