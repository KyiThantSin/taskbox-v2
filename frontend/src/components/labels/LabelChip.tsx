import type { LabelChipProps } from '../../types/label';

export default function LabelChip({ name, compact = false }: LabelChipProps) {
  if (compact) {
    return <span className="bg-black text-white border-black inline-block h-2 w-9 rounded-full border" title={name || 'Label'} />;
  }
  return (
    <span className="bg-black text-white border-black inline-flex max-w-full items-center rounded-md border-2 px-2 py-0.5 text-xs font-bold">
      <span className="truncate">{name || 'Label'}</span>
    </span>
  );
}
