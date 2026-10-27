import type { DueFilterOption } from '../../types/board';
import { FilterX, Search } from 'lucide-react';
import type { DueFilter, FilterBarProps } from '../../types/board';

import { NO_FILTERS, hasFilters } from '../../utils';

const DUE_OPTIONS: DueFilterOption[] = [
  { value: 'any', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'soon', label: 'Due today / tomorrow' },
  { value: 'none', label: 'No due date' },
];

export default function FilterBar({ filters, onChange, labels, searchRef }: FilterBarProps) {
  const select = 'rounded-lg border-2 border-black bg-white px-2 py-1.5 font-mono text-xs font-bold';
  return (
    <div className="flex flex-wrap items-center gap-2" role="search">
      <div className="relative min-w-[12rem] flex-1">
        <label htmlFor="search" className="sr-only">Search cards by title</label>
        <Search size={15} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          id="search"
          ref={searchRef}
          type="search"
          className="input py-1.5 pl-9 pr-9 text-sm"
          placeholder="Search cards…"
          autoComplete="off"
          value={filters.text}
          onChange={(e) => onChange({ ...filters, text: e.target.value })}
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border-2 border-black px-1.5 font-mono text-xs sm:block" aria-hidden="true">/</kbd>
      </div>

      <label htmlFor="filter-label" className="sr-only">Filter by label</label>
      <select
        id="filter-label"
        className={select}
        value={filters.labelId ?? ''}
        onChange={(e) => onChange({ ...filters, labelId: e.target.value === '' ? null : Number(e.target.value) })}
      >
        <option value="">Any label</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>{l.name || `(${l.style})`}</option>
        ))}
      </select>

      <label htmlFor="filter-due" className="sr-only">Filter by due date</label>
      <select id="filter-due" className={select} value={filters.due} onChange={(e) => onChange({ ...filters, due: e.target.value as DueFilter })}>
        {DUE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters(filters) && (
        <button type="button" className="btn-alt btn-sm" onClick={() => onChange(NO_FILTERS)}>
          <FilterX size={14} aria-hidden="true" /> Clear
        </button>
      )}
    </div>
  );
}
