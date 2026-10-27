import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlignLeft, ArrowRightLeft, CalendarDays, Check, Copy, Link2, Link2Off, Tag, Trash2, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useCardAction } from '../../hooks';
import { boardService } from '../../services/boardService';
import { cardService } from '../../services/cardService';
import { shareService } from '../../services/shareService';
import type { Board } from '../../types/board';
import type { CardContentProps, CardDetail, CardModalProps } from '../../types/card';
import { fullDate } from '../../utils';
import { useConfirm } from '../common/ConfirmModal';
import ErrorLine, { ErrorCard } from '../common/ErrorLine';
import Spinner from '../common/Spinner';
import LabelChip from '../labels/LabelChip';
import LabelPicker from '../labels/LabelPicker';
import AttachmentsSection from './AttachmentsSection';
import ChecklistSection from './ChecklistSection';
import CommentsSection from './CommentsSection';
import DueBadge from './DueBadge';

export default function CardModal({ cardId, onClose }: CardModalProps) {
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: card, isError, refetch } = useQuery<CardDetail>({
    queryKey: ['card', cardId],
    queryFn: () => cardService.getCard(cardId),
  });

  const { data: board } = useQuery<Board>({
    queryKey: ['board', card?.boardId],
    queryFn: () => boardService.getBoard(card!.boardId),
    enabled: Boolean(card),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={card ? `Card ${card.title}` : 'Card'}
        className="card relative my-auto w-full max-w-3xl animate-slide-in bg-white p-4 outline-none sm:p-6"
      >
        <button type="button" onClick={onClose} className="btn-alt btn-sm absolute right-3 top-3" aria-label="Close card">
          <X size={14} aria-hidden="true" /> Esc
        </button>

        {isError && <ErrorCard onRetry={() => refetch()} text="Cannot load this card" />}
        {!card && !isError && <Spinner label="Loading card…" />}
        {card && <CardContent card={card} board={board} onClose={onClose} queryClient={queryClient} />}
      </div>
    </div>
  );
}

function CardContent({
  card,
  board,
  onClose,
  queryClient,
}: CardContentProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [editingDescription, setEditingDescription] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setTitle(card.title), [card.title]);

  const patch = useCardAction(card.id, (p: Parameters<typeof cardService.patchCard>[1]) => cardService.patchCard(card.id, p));

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['board', card.boardId] });
    queryClient.invalidateQueries({ queryKey: ['boards'] });
    queryClient.invalidateQueries({ queryKey: ['card', card.id] });
  };
  const move = useMutation({
    mutationFn: (listId: number) => {
      const target = board?.lists.find((l) => l.id === listId);
      return cardService.moveCard(card.id, listId, target ? target.cards.length : 0);
    },
    onSuccess: refreshAll,
  });
  const share = useMutation({ mutationFn: () => shareService.share(card.id), onSuccess: refreshAll });
  const unshare = useMutation({ mutationFn: () => shareService.unshare(card.id), onSuccess: refreshAll });
  const confirm = useConfirm();
  const remove = useMutation({
    mutationFn: () => cardService.deleteCard(card.id),
    onSuccess: () => {
      onClose();
      queryClient.removeQueries({ queryKey: ['card', card.id] });
      queryClient.invalidateQueries({ queryKey: ['board', card.boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const onDeleteCard = async () => {
    const authorText = card.author ? ` (created by ${card.author.name})` : '';
    const ok = await confirm({
      title: 'Delete card',
      message: `Delete the card "${card.title}"${authorText} and its images? This cannot be undone.`,
      confirmText: 'Delete card',
      isDestructive: true,
    });
    if (ok) remove.mutate();
  };

  const saveTitle = (e?: FormEvent) => {
    e?.preventDefault();
    const t = title.trim();
    if (!t) return setTitle(card.title);
    if (t !== card.title) patch.mutate({ title: t });
  };

  const saveDescription = (e: FormEvent) => {
    e.preventDefault();
    patch.mutate({ description: description.trim() || null }, { onSuccess: () => setEditingDescription(false) });
  };

  const link = card.shareToken ? `${window.location.origin}/?share=${card.shareToken}` : null;
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cardLabels = board?.labels.filter((l) => card.labelIds.includes(l.id)) ?? [];
  const sideButton = 'btn-alt btn-sm w-full justify-start';
  const error = patch.error ?? move.error ?? share.error ?? unshare.error ?? remove.error;

  return (
    <div className="flex flex-col gap-5">
      <header className="pr-16">
        <p className="font-mono text-xs text-neutral-600">
          in list <span className="font-bold text-black">{card.listTitle}</span>
        </p>
        <form onSubmit={saveTitle}>
          <label htmlFor="card-title" className="sr-only">Card title</label>
          <input
            id="card-title"
            className="mt-1 w-full rounded-lg border-2 border-transparent bg-transparent px-1 py-0.5 text-2xl font-black tracking-tight hover:border-neutral-300 focus:border-black"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => saveTitle()}
          />
        </form>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_13rem]">
        {/* ---------- main column ---------- */}
        <div className="flex min-w-0 flex-col gap-6">
          {(cardLabels.length > 0 || card.dueDate) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {cardLabels.length > 0 && (
                <div>
                  <h3 className="label mb-1">Labels</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cardLabels.map((l) => (
                      <LabelChip key={l.id} name={l.name} />
                    ))}
                  </div>
                </div>
              )}
              {card.dueDate && (
                <div>
                  <h3 className="label mb-1">Due</h3>
                  <DueBadge dueDate={card.dueDate} completed={card.completed} size="md" />
                </div>
              )}
            </div>
          )}

          <section aria-labelledby="desc-h">
            <h3 id="desc-h" className="label mb-2 flex items-center gap-1.5"><AlignLeft size={14} aria-hidden="true" /> Description</h3>
            {editingDescription ? (
              <form onSubmit={saveDescription} className="flex flex-col gap-2">
                <label htmlFor="desc" className="sr-only">Description</label>
                <textarea id="desc" autoFocus className="input resize-y text-sm" rows={5} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a more detailed description…" />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-sm" disabled={patch.isPending}>Save</button>
                  <button type="button" className="btn-alt btn-sm" onClick={() => { setDescription(card.description ?? ''); setEditingDescription(false); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => { setDescription(card.description ?? ''); setEditingDescription(true); }}
                className="w-full rounded-lg border-2 border-transparent p-2 text-left text-sm hover:border-neutral-300 hover:bg-neutral-100"
              >
                {card.description ? <span className="whitespace-pre-wrap break-words">{card.description}</span> : <span className="text-neutral-500">Add a more detailed description…</span>}
              </button>
            )}
          </section>

          <AttachmentsSection card={card} />
          <ChecklistSection card={card} />
          <CommentsSection card={card} />
        </div>

        {/* side column */}
        <aside className="flex flex-col gap-4" aria-label="Card actions">
          <div>
            <h3 className="label mb-2">Add to card</h3>
            <button type="button" className={sideButton} aria-expanded={showLabels} onClick={() => setShowLabels(!showLabels)}>
              <Tag size={14} aria-hidden="true" /> Labels
            </button>
            {showLabels && board && (
              <div className="mt-2 rounded-lg border-2 border-black bg-neutral-50 p-2.5">
                <LabelPicker card={card} labels={board.labels} boardId={board.id} />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="due" className="label mb-2 flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" /> Due date</label>
            <input
              id="due"
              type="date"
              className="w-full rounded-lg border-2 border-black bg-white px-2 py-1 font-mono text-sm"
              value={card.dueDate ?? ''}
              onChange={(e) => patch.mutate({ dueDate: e.target.value || null })}
            />
            <button
              type="button"
              role="checkbox"
              aria-checked={card.completed}
              disabled={!card.dueDate}
              onClick={() => patch.mutate({ completed: !card.completed })}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border-2 border-black bg-white px-2 py-1.5 text-sm font-bold hover:bg-neutral-100 disabled:opacity-40"
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded border-2 border-black ${card.completed ? 'bg-black text-white' : 'bg-white'}`}>
                {card.completed && <Check size={12} strokeWidth={3} aria-hidden="true" />}
              </span>
              Mark complete
            </button>
          </div>

          {board && (
            <div>
              <label htmlFor="move" className="label mb-2 flex items-center gap-1"><ArrowRightLeft size={12} aria-hidden="true" /> Move to list</label>
              <select
                id="move"
                className="w-full rounded-lg border-2 border-black bg-white px-2 py-1.5 font-mono text-xs font-bold"
                value={card.listId}
                onChange={(e) => move.mutate(Number(e.target.value))}
              >
                {board.lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <h3 className="label mb-2">Share</h3>
            {link ? (
              <div className="flex flex-col gap-2">
                <input readOnly aria-label="Share link" value={link} onFocus={(e) => e.target.select()} className="w-full rounded-lg border-2 border-dashed border-black bg-transparent p-1.5 font-mono text-[11px]" />
                <button type="button" className="btn btn-sm w-full justify-start" onClick={copy}>
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />} {copied ? 'Copied' : 'Copy link'}
                </button>
                <button type="button" className={sideButton} onClick={() => unshare.mutate()} disabled={unshare.isPending}>
                  <Link2Off size={14} aria-hidden="true" /> Unshare
                </button>
              </div>
            ) : (
              <button type="button" className={sideButton} onClick={() => share.mutate()} disabled={share.isPending}>
                <Link2 size={14} aria-hidden="true" /> Share read-only link
              </button>
            )}
          </div>

          <div>
            <h3 className="label mb-2">Danger zone</h3>
            <button type="button" className={sideButton} onClick={onDeleteCard} disabled={remove.isPending}>
              <Trash2 size={14} aria-hidden="true" /> Delete card
            </button>
          </div>
          <div className="font-mono text-[11px] text-neutral-600">
            {card.author && (
              <p className="truncate">
                Created by <span className="font-bold text-black">{card.author.name}</span>
              </p>
            )}
            <p title={fullDate(card.createdAt)}>Created {fullDate(card.createdAt)}</p>
          </div>
        </aside>
      </div>

      {error != null && <ErrorLine error={error} />}
    </div>
  );
}
