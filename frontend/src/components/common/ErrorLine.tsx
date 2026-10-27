import type { ErrorCardProps, ErrorLineProps } from '../../types/common';
import { errorMessage } from '../../utils';

export default function ErrorLine({ error, onRetry }: ErrorLineProps) {
  return (
    <p role="alert" className="flex flex-wrap items-center gap-2 border-l-4 border-black pl-2 font-mono text-xs">
      <span>✕ {errorMessage(error)}</span>
      {onRetry && (
        <button type="button" className="btn-alt btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </p>
  );
}

export function ErrorCard({ onRetry, text = 'Cannot reach API' }: ErrorCardProps) {
  return (
    <div role="alert" className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="font-mono text-sm">✕ {text}</p>
      <button type="button" className="btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
