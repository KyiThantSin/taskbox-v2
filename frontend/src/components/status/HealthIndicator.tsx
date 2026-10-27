import { useQuery } from '@tanstack/react-query';
import { Circle, CircleDashed, CircleX } from 'lucide-react';
import { systemService } from '../../services/systemService';
import type { DbState, HealthState as State } from '../../types/system';

export default function HealthIndicator() {
  const { data, isError, isPending } = useQuery<DbState>({
    queryKey: ['health'],
    queryFn: systemService.getDatabaseState,
    refetchInterval: 5000,
    retry: false,
  });

  let state: State = 'checking';
  if (isError) state = 'unreachable';
  else if (!isPending && data) state = data;

  const text: Record<State, string> = {
    up: 'API ok · DB up',
    down: 'API ok · DB down',
    unreachable: 'API unreachable',
    checking: 'Checking…',
  };

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold"
      role="status"
      aria-live="polite"
      title="Health of the API and database (checked every 5 seconds)"
    >
      {state === 'up' && <Circle size={14} fill="currentColor" className="animate-pulse-dot" aria-hidden="true" />}
      {state === 'down' && <Circle size={14} strokeWidth={3} aria-hidden="true" />}
      {state === 'unreachable' && <CircleX size={14} strokeWidth={3} aria-hidden="true" />}
      {state === 'checking' && <CircleDashed size={14} className="text-neutral-500" aria-hidden="true" />}
      <span>{text[state]}</span>
    </div>
  );
}
