import { MessageSquare, Trash2, User } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useCardAction } from '../../hooks';
import { commentService } from '../../services/commentService';
import type { CommentsSectionProps } from '../../types/card';
import { fullDate, timeAgo } from '../../utils';
import ErrorLine from '../common/ErrorLine';

export default function CommentsSection({ card }: CommentsSectionProps) {
  const [body, setBody] = useState('');
  const add = useCardAction(card.id, (b: string) => commentService.addComment(card.id, b));
  const remove = useCardAction(card.id, (id: number) => commentService.deleteComment(id));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    add.mutate(body.trim(), { onSuccess: () => setBody('') });
  };

  return (
    <section aria-labelledby="comments-h">
      <h3 id="comments-h" className="label mb-2 flex items-center gap-1.5"><MessageSquare size={14} aria-hidden="true" /> Comments ({card.comments.length})</h3>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="new-comment" className="sr-only">Write a comment</label>
        <textarea id="new-comment" className="input resize-y text-sm" rows={2} maxLength={1000} placeholder="Write a comment…" value={body} onChange={(e) => setBody(e.target.value)} />
        <button type="submit" className="btn btn-sm self-start" disabled={!body.trim() || add.isPending}>Comment</button>
      </form>
      {(add.error ?? remove.error) != null && <div className="mt-2"><ErrorLine error={add.error ?? remove.error} /></div>}
      <ul className="mt-3 flex flex-col gap-2">
        {card.comments.map((c) => (
          <li key={c.id} className="rounded-lg border-2 border-black bg-white p-2.5">
            {c.user && (
              <div className="mb-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-800">
                  <User size={10} aria-hidden="true" />
                  <span className="max-w-[140px] truncate">{c.user.name}</span>
                </span>
              </div>
            )}
            <p className="whitespace-pre-wrap break-words text-sm">{c.body}</p>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-neutral-600">
              <time dateTime={c.createdAt} title={fullDate(c.createdAt)}>{timeAgo(c.createdAt)}</time>
              <button type="button" className="inline-flex items-center gap-1 hover:text-black" onClick={() => remove.mutate(c.id)} aria-label="Delete comment">
                <Trash2 size={12} aria-hidden="true" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
