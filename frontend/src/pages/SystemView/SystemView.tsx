import { useQuery } from '@tanstack/react-query';
import { Clock, Container, Database, Hash, Network, RefreshCw } from 'lucide-react';
import { ErrorCard } from '../../components/common/ErrorLine';
import Spinner, { MiniSpinner } from '../../components/common/Spinner';
import { systemService } from '../../services/systemService';
import type { BarProps, Info, StatProps, SystemViewProps } from '../../types/system';
import { formatBytes, formatUptime } from '../../utils';

function Stat({ label, value, Icon }: StatProps) {
  return (
    <div className="card p-4">
      <div className="label flex items-center gap-1.5"><Icon size={13} aria-hidden="true" /> {label}</div>
      <div className="mt-2 break-all font-mono text-xl font-bold">{value}</div>
    </div>
  );
}

function Bar({ percent, label }: BarProps) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      className="h-4 w-full overflow-hidden rounded-full border-2 border-black bg-white"
    >
      <div className="h-full bg-black transition-all duration-500" style={{ width: `${p}%` }} />
    </div>
  );
}

export default function SystemView({ enabled = true }: SystemViewProps) {
  const { data, isPending, isError, isFetching, dataUpdatedAt, refetch } = useQuery<Info>({
    queryKey: ['info'],
    queryFn: systemService.getInfo,
    refetchInterval: 5000,
    retry: false,
    enabled,
  });

  if (isPending && !isError) return <Spinner label="Reading container info…" />;
  if (!data) return <ErrorCard onRetry={() => refetch()} />;

  const m = data.memory;
  const limit = data.memoryLimitBytes;
  const procPercent = limit ? (m.processRssBytes / limit) * 100 : 0;
  const db = data.database;

  return (
    <section aria-label="System information" className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="label">API</h2>
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-600">
          {isFetching ? <MiniSpinner /> : <RefreshCw size={13} aria-hidden="true" />}
          <span>Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
          {isError && <span>· refresh failed</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Container hostname" value={data.hostname} Icon={Container} />
        <Stat label="PID" value={data.pid} Icon={Hash} />
        <Stat label="Process uptime" value={formatUptime(data.uptimeSeconds)} Icon={Clock} />
      </div>

      <h2 className="label">Database</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat label="Database host" value={data.databaseHost} Icon={Network} />
        <Stat label="Status" value={db.status} Icon={Database} />
      </div>

      <div className="card p-4">
        <h3 className="label">Memory</h3>
        <div className="mt-4">
          <div className="mb-1.5 flex flex-wrap justify-between gap-2 font-mono text-sm">
            <span>API process memory / container limit</span>
            <span className="font-bold">{formatBytes(m.processRssBytes)} / {limit ? data.memoryLimit : 'Unavailable'}</span>
          </div>
          {limit ? (
            <Bar percent={procPercent} label="API process memory versus container memory limit" />
          ) : (
            <p className="mt-1 font-mono text-xs text-neutral-600">Container memory limit is unavailable.</p>
          )}
        </div>
      </div>

    </section>
  );
}
