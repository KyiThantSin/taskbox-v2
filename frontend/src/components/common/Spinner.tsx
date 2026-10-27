import { LoaderCircle } from 'lucide-react';
import type { SpinnerProps } from '../../types/common';

export default function Spinner({ label = 'Loading…' }: SpinnerProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-10">
      <div className="h-3 w-48 overflow-hidden rounded-full border-2 border-black">
        <div className="stripes h-full w-full animate-stripes" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-neutral-600">{label}</span>
    </div>
  );
}

export function MiniSpinner() {
  return <LoaderCircle size={14} className="animate-spin" aria-label="Working" />;
}
