import { ArrowDown, ArrowUp, CheckSquare, ImageIcon, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SortKey, TableRow, TableViewProps } from '../../types/board';
import DueBadge from '../../components/card/DueBadge';
import LabelChip from '../../components/labels/LabelChip';

export default function TableView({ board, cards, onOpenCard }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('list');
  const [asc, setAsc] = useState(true);

  const rows = useMemo<TableRow[]>(() => {
    const shown = new Set(cards.map((c) => c.id));
    const all: TableRow[] = [];
    board.lists.forEach((list, listIndex) => {
      for (const card of list.cards) if (shown.has(card.id)) all.push({ card, listTitle: list.title, listIndex });
    });

    return all.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'title':
          diff = a.card.title.localeCompare(b.card.title);
          break;
        case 'list':
          diff = a.listIndex - b.listIndex;
          break;
        case 'due':
          diff = (a.card.dueDate ?? '9999-99-99').localeCompare(b.card.dueDate ?? '9999-99-99');
          break;
        case 'checklist': {
          const aRatio = a.card.checklist.total ? a.card.checklist.done / a.card.checklist.total : -1;
          const bRatio = b.card.checklist.total ? b.card.checklist.done / b.card.checklist.total : -1;
          diff = aRatio - bRatio;
          break;
        }
      }
      return asc ? diff : -diff;
    });
  }, [board, cards, sortKey, asc]);

  const header = (key: SortKey, label: string) => (
    <th scope="col" className="px-3 py-2 text-left" aria-sort={sortKey === key ? (asc ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="label inline-flex items-center gap-1 hover:text-black"
        onClick={() => {
          if (sortKey === key) setAsc(!asc);
          else {
            setSortKey(key);
            setAsc(true);
          }
        }}
      >
        {label}
        {sortKey === key && (asc ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
      </button>
    </th>
  );

  if (rows.length === 0) return <p className="card p-6 text-center font-mono text-sm">No cards to show.</p>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead className="border-b-2 border-black bg-neutral-100">
          <tr>
            {header('title', 'Card')}
            {header('list', 'List')}
            <th scope="col" className="label px-3 py-2 text-left">Labels</th>
            {header('due', 'Due')}
            {header('checklist', 'Checklist')}
            <th scope="col" className="label px-3 py-2 text-left">Activity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ card, listTitle }) => (
            <tr key={card.id} className="border-b border-neutral-300 last:border-0 hover:bg-neutral-100">
              <td className="max-w-[16rem] px-3 py-2">
                <button type="button" className={`text-left font-bold hover:underline ${card.completed ? 'text-neutral-500 line-through' : ''}`} onClick={() => onOpenCard(card.id)}>
                  {card.title}
                </button>
              </td>
              <td className="px-3 py-2 font-mono text-xs">{listTitle}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {board.labels
                    .filter((l) => card.labelIds.includes(l.id))
                    .map((l) => (
                      <LabelChip key={l.id} name={l.name} />
                    ))}
                </div>
              </td>
              <td className="px-3 py-2"><DueBadge dueDate={card.dueDate} completed={card.completed} /></td>
              <td className="px-3 py-2 font-mono text-xs">
                {card.checklist.total > 0 ? (
                  <span className="inline-flex items-center gap-1"><CheckSquare size={12} aria-hidden="true" /> {card.checklist.done}/{card.checklist.total}</span>
                ) : (
                  <span className="text-neutral-400">–</span>
                )}
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1" title="Comments"><MessageSquare size={12} aria-hidden="true" /> {card.commentCount}</span>
                  <span className="inline-flex items-center gap-1" title="Images"><ImageIcon size={12} aria-hidden="true" /> {card.attachmentCount}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
