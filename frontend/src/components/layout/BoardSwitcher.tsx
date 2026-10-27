import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { boardService } from '../../services/boardService';
import type { BoardSummary, BoardSwitcherProps } from '../../types/board';
import ErrorLine from '../common/ErrorLine';

export default function BoardSwitcher({ boardId, onChange }: BoardSwitcherProps) {
  const queryClient = useQueryClient();
  const { data: boards } = useQuery<BoardSummary[]>({ queryKey: ['boards'], queryFn: boardService.listBoards });
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!boards) return;
    if (boards.length === 0) {
      if (boardId !== null) onChange(null);
    } else if (boardId === null || !boards.some((b) => b.id === boardId)) {
      onChange(boards[0].id);
    }
  }, [boards, boardId, onChange]);

  const create = useMutation({
    mutationFn: (t: string) => boardService.createBoard(t),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onChange(board.id);
      setTitle('');
      setCreating(false);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) create.mutate(title.trim());
  };

  if (creating) {
    return (
      <form onSubmit={submit} className="flex items-center gap-2">
        <label htmlFor="new-board" className="sr-only">New board title</label>
        <input id="new-board" autoFocus className="input w-44 py-1 text-sm" placeholder="Board title…" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setCreating(false)} />
        <button type="submit" className="btn btn-sm" disabled={!title.trim() || create.isPending}>Create</button>
        <button type="button" className="btn-alt btn-sm" aria-label="Cancel" onClick={() => setCreating(false)}>
          <X size={14} aria-hidden="true" />
        </button>
        {create.isError && <ErrorLine error={create.error} />}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="board-select" className="sr-only">Board</label>
      <select
        id="board-select"
        className="max-w-[12rem] rounded-lg border-2 border-black bg-white px-2 py-1.5 text-sm font-bold"
        value={boardId ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={!boards || boards.length === 0}
      >
        {(!boards || boards.length === 0) && <option value="">No boards</option>}
        {boards?.map((b) => (
          <option key={b.id} value={b.id}>{b.title} ({b.cardCount})</option>
        ))}
      </select>
      <button type="button" className="btn-alt btn-sm" onClick={() => setCreating(true)}>
        <Plus size={14} aria-hidden="true" /> New board
      </button>
    </div>
  );
}
