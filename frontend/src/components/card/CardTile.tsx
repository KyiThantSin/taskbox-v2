import type { CardTileProps } from '../../types/card';
import { AlignLeft, CheckSquare, Link2, MessageSquare, Paperclip, User } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import LabelChip from '../labels/LabelChip';
import DueBadge from './DueBadge';

export default function CardTile({ card, labels, dragging, onOpen, onDragStart, onDragEnd }: CardTileProps) {
  const cardLabels = labels.filter((l) => card.labelIds.includes(l.id));
  const allDone = card.checklist.total > 0 && card.checklist.done === card.checklist.total;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(card.id);
    }
  };

  return (
    <article
      draggable
      data-card-id={card.id}
      tabIndex={0}
      role="button"
      aria-label={`Open card ${card.title}`}
      onClick={() => onOpen(card.id)}
      onKeyDown={onKey}
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      className={`group mb-3 cursor-grab overflow-hidden rounded-lg border-2 border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] active:cursor-grabbing ${
        dragging ? 'opacity-40' : ''
      }`}
    >
      {card.coverUrl && (
        <img src={card.coverUrl} alt="" loading="lazy" draggable={false} className="h-28 w-full border-b-2 border-black object-cover" />
      )}
      <div className="p-2.5">
        {cardLabels.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {cardLabels.map((l) => (
              <LabelChip key={l.id} name={l.name} compact />
            ))}
          </div>
        )}
        <h4 className={`break-words text-sm font-bold leading-snug ${card.completed ? 'text-neutral-500 line-through' : ''}`}>{card.title}</h4>

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-neutral-700">
          <DueBadge dueDate={card.dueDate} completed={card.completed} />
          {card.hasDescription && <AlignLeft size={13} aria-label="Has description" />}
          {card.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5" title="Comments">
              <MessageSquare size={12} aria-hidden="true" /> {card.commentCount}
            </span>
          )}
          {card.attachmentCount > 0 && (
            <span className="inline-flex items-center gap-0.5" title="Images">
              <Paperclip size={12} aria-hidden="true" /> {card.attachmentCount}
            </span>
          )}
          {card.checklist.total > 0 && (
            <span
              className={`inline-flex items-center gap-0.5 rounded px-1 ${allDone ? 'bg-black text-white' : ''}`}
              title="Checklist progress"
            >
              <CheckSquare size={12} aria-hidden="true" /> {card.checklist.done}/{card.checklist.total}
            </span>
          )}
          {card.shared && <Link2 size={12} aria-label="Shared" />}
          {card.author && (
            <span
              className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1 py-0.5 font-mono text-[10px] font-semibold text-neutral-800"
              title={`Created by ${card.author.name}`}
            >
              <User size={10} aria-hidden="true" />
              <span className="max-w-[70px] truncate">{card.author.name}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
