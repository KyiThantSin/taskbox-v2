import { Check, ListChecks, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useCardAction } from '../../hooks';
import { checklistService } from '../../services/checklistService';
import type { ChecklistSectionProps, ChecklistToggleInput } from '../../types/card';
import ErrorLine from '../common/ErrorLine';

export default function ChecklistSection({ card }: ChecklistSectionProps) {
  const [text, setText] = useState('');
  const items = card.checklistItems;
  const done = items.filter((i) => i.done).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  const add = useCardAction(card.id, (t: string) => checklistService.addChecklistItem(card.id, t));
  const toggle = useCardAction(card.id, (v: ChecklistToggleInput) => checklistService.patchChecklistItem(v.id, { done: v.done }));
  const remove = useCardAction(card.id, (id: number) => checklistService.deleteChecklistItem(id));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    add.mutate(text.trim(), { onSuccess: () => setText('') });
  };

  return (
    <section aria-labelledby="checklist-h">
      <h3 id="checklist-h" className="label mb-2 flex items-center gap-1.5"><ListChecks size={14} aria-hidden="true" /> Checklist</h3>
      {items.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <span className="w-9 font-mono text-xs font-bold">{percent}%</span>
          <div
            role="progressbar"
            aria-label="Checklist progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-black bg-white"
          >
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              aria-label={`Mark "${item.text}" ${item.done ? 'not done' : 'done'}`}
              onClick={() => toggle.mutate({ id: item.id, done: !item.done })}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-black ${item.done ? 'bg-black text-white' : 'bg-white'}`}
            >
              {item.done && <Check size={12} strokeWidth={3} aria-hidden="true" />}
            </button>
            <span className={`min-w-0 flex-1 break-words text-sm ${item.done ? 'text-neutral-500 line-through' : ''}`}>{item.text}</span>
            <button
              type="button"
              className="rounded p-1 opacity-60 hover:bg-neutral-200 hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Delete "${item.text}"`}
              onClick={() => remove.mutate(item.id)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label htmlFor="new-item" className="sr-only">New checklist item</label>
        <input id="new-item" className="input py-1.5 text-sm" placeholder="Add an item…" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-sm" disabled={!text.trim() || add.isPending}>
          <Plus size={14} aria-hidden="true" /> Add
        </button>
      </form>
      {(add.error ?? toggle.error ?? remove.error) != null && (
        <div className="mt-2"><ErrorLine error={add.error ?? toggle.error ?? remove.error} /></div>
      )}
    </section>
  );
}
