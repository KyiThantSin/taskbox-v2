import { Inbox, LayoutDashboard, SearchX } from 'lucide-react';
import type { EmptyStateProps, EmptyStateVariant as Variant } from '../../types/common';

const CONTENT: Record<Variant, { Icon: typeof Inbox; title: string; text: string }> = {
  boards: { Icon: LayoutDashboard, title: 'No boards yet', text: 'Create your first board to start organising tasks.' },
  board: { Icon: Inbox, title: 'No cards yet', text: 'No cards yet. Add your first one to a list.' },
  filter: { Icon: SearchX, title: 'No cards match your filters', text: 'Try a different word or clear the filters.' },
};

export default function EmptyState({ variant, children }: EmptyStateProps) {
  const { Icon, title, text } = CONTENT[variant];
  return (
    <div className="card mx-auto flex max-w-md animate-slide-in flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="rounded-full border-2 border-dashed border-black p-5">
        <Icon size={44} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
      <p className="max-w-xs text-sm text-neutral-600">{text}</p>
      {children}
    </div>
  );
}
