import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useCardAction } from '../../hooks';
import { labelService } from '../../services/labelService';
import type { Label, LabelPickerProps, LabelToggleInput } from '../../types/label';
import { useConfirm } from '../common/ConfirmModal';
import ErrorLine from '../common/ErrorLine';
import LabelChip from './LabelChip';

export default function LabelPicker({ card, labels, boardId }: LabelPickerProps) {
  const queryClient = useQueryClient();
  const refreshBoard = () => queryClient.invalidateQueries({ queryKey: ['board', boardId] });

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const toggle = useCardAction(card.id, (v: LabelToggleInput) => labelService.setCardLabel(card.id, v.labelId, v.on));
  const create = useMutation({
    mutationFn: () => labelService.createLabel(boardId, newName.trim(), 'solid'),
    onSuccess: () => {
      setNewName('');
      refreshBoard();
    },
  });
  const update = useMutation({
    mutationFn: (id: number) => labelService.updateLabel(id, { name: editName.trim() }),
    onSuccess: () => {
      setEditingId(null);
      refreshBoard();
    },
  });
  const confirm = useConfirm();
  const remove = useMutation({
    mutationFn: (id: number) => labelService.deleteLabel(id),
    onSuccess: () => {
      refreshBoard();
      queryClient.invalidateQueries({ queryKey: ['card', card.id] });
    },
  });

  const onDeleteLabel = async (label: Label) => {
    const labelTitle = label.name || label.style;
    const ok = await confirm({
      title: 'Delete label',
      message: `Delete the label "${labelTitle}" from the whole board? This cannot be undone.`,
      confirmText: 'Delete label',
      isDestructive: true,
    });
    if (ok) remove.mutate(label.id);
  };

  const submitCreate = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  const error = toggle.error ?? create.error ?? update.error ?? remove.error;

  return (
    <div className="flex flex-col gap-3">
      {labels.length === 0 && <p className="font-mono text-xs text-neutral-600">No labels yet. Create the first one below.</p>}
      <ul className="flex flex-col gap-2">
        {labels.map((label) => {
          const on = card.labelIds.includes(label.id);
          if (editingId === label.id) {
            return (
              <li key={label.id} className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-black p-2">
                <input className="input py-1 text-sm" value={editName} maxLength={30} aria-label="Label name" onChange={(e) => setEditName(e.target.value)} />
                <div className="flex gap-2">
                  <button type="button" className="btn btn-sm" onClick={() => update.mutate(label.id)}>Save</button>
                  <button type="button" className="btn-alt btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </li>
            );
          }
          return (
            <li key={label.id} className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`${on ? 'Remove' : 'Add'} label ${label.name || label.style}`}
                onClick={() => toggle.mutate({ labelId: label.id, on: !on })}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border-2 border-black bg-white p-1.5 hover:bg-neutral-100"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-black ${on ? 'bg-black text-white' : 'bg-white'}`}>
                  {on && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                </span>
                <LabelChip name={label.name} />
              </button>
              <button
                type="button"
                className="rounded p-1 hover:bg-neutral-200"
                aria-label={`Edit label ${label.name || label.style}`}
                onClick={() => {
                  setEditingId(label.id);
                  setEditName(label.name);
                }}
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="rounded p-1 hover:bg-neutral-200"
                aria-label={`Delete label ${label.name || label.style}`}
                onClick={() => onDeleteLabel(label)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={submitCreate} className="flex flex-col gap-2 border-t-2 border-neutral-200 pt-3">
        <label htmlFor="new-label" className="label">New label</label>
        <input id="new-label" className="input py-1 text-sm" placeholder="Name (optional)" value={newName} maxLength={30} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="btn btn-sm self-start" disabled={create.isPending}>
          <Plus size={14} aria-hidden="true" /> Create label
        </button>
      </form>
      {error != null && <ErrorLine error={error} />}
    </div>
  );
}
