import type { DueBadgeProps } from '../../types/card';
import { AlertTriangle, CalendarDays, CircleCheck } from 'lucide-react';
import { dueInfo } from '../../utils';

export default function DueBadge({ dueDate, completed, size = 'sm' }: DueBadgeProps) {
  const due = dueInfo(dueDate, completed);
  if (!due) return null;

  let Icon = CalendarDays;
  let style = 'border-black bg-white text-black';
  let status = '';
  if (completed) {
    Icon = CircleCheck;
    style = 'border-black bg-black text-white';
    status = 'complete';
  } else if (due.overdue) {
    Icon = AlertTriangle;
    style = 'border-black bg-black text-white';
    status = 'overdue';
  } else if (due.soon) {
    style = 'border-dashed border-black bg-neutral-100 text-black';
    status = 'due soon';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border-2 px-1.5 py-0.5 font-mono font-bold ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${style}`}
      title={`Due ${due.date}${status ? ` (${status})` : ''}`}
    >
      <Icon size={size === 'sm' ? 11 : 13} aria-hidden="true" />
      {due.label}
      {status && <span className="sr-only"> {status}</span>}
    </span>
  );
}
