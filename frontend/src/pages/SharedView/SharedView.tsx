import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, Link2Off } from 'lucide-react';
import DueBadge from '../../components/card/DueBadge';
import { ErrorCard } from '../../components/common/ErrorLine';
import Spinner from '../../components/common/Spinner';
import LabelChip from '../../components/labels/LabelChip';
import { shareService } from '../../services/shareService';
import type { SharedCard, SharedViewProps } from '../../types/card';
import { fullDate, isNotFoundError } from '../../utils';

export default function SharedView({ token }: SharedViewProps) {
  const { data, isPending, isError, error, refetch } = useQuery<SharedCard>({
    queryKey: ['shared', token],
    queryFn: () => shareService.getSharedCard(token),
    retry: false,
  });

  let body;
  if (isPending) {
    body = <Spinner label="Loading shared card…" />;
  } else if (isError && isNotFoundError(error)) {
    body = (
      <div className="card p-8 text-center">
        <Link2Off size={56} strokeWidth={1.75} className="mx-auto" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black tracking-tight">This shared link is not valid</h2>
        <p className="mt-2 text-sm text-neutral-600">It may have been unshared or deleted by its owner.</p>
      </div>
    );
  } else if (isError) {
    body = <ErrorCard onRetry={() => refetch()} />;
  } else {
    const done = data.checklist.filter((i) => i.done).length;
    const otherImages = data.images.filter((i) => i.url !== data.coverUrl);
    body = (
      <article className="card overflow-hidden">
        {data.coverUrl && <img src={data.coverUrl} alt="" className="max-h-72 w-full border-b-2 border-black object-cover" />}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label">Shared card · in list {data.listTitle}</span>
            <DueBadge dueDate={data.dueDate} completed={data.completed} size="md" />
          </div>
          <h2 className={`mt-4 break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl ${data.completed ? 'text-neutral-500 line-through decoration-4' : ''}`}>
            {data.title}
          </h2>
          {data.labels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.labels.map((l, i) => (
                <LabelChip key={i} name={l.name} />
              ))}
            </div>
          )}
          {data.description && <p className="mt-4 whitespace-pre-wrap break-words text-neutral-700">{data.description}</p>}

          {data.checklist.length > 0 && (
            <section className="mt-6 border-t-2 border-black pt-4" aria-label="Checklist">
              <h3 className="label mb-2">Checklist · {done}/{data.checklist.length}</h3>
              <ul className="flex flex-col gap-1.5">
                {data.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-black ${item.done ? 'bg-black text-white' : 'bg-white'}`}>
                      {item.done && <Check size={12} strokeWidth={3} aria-label="done" />}
                    </span>
                    <span className={item.done ? 'text-neutral-500 line-through' : ''}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {otherImages.length > 0 && (
            <section className="mt-6 grid grid-cols-2 gap-3 border-t-2 border-black pt-4 sm:grid-cols-3" aria-label="Images">
              {otherImages.map((img, i) => (
                <a key={i} href={img.url} target="_blank" rel="noreferrer">
                  <img src={img.url} alt={`Attachment ${i + 1}`} loading="lazy" className="h-28 w-full rounded-lg border-2 border-black object-cover" />
                </a>
              ))}
            </section>
          )}

          <p className="mt-6 border-t-2 border-black pt-3 font-mono text-xs text-neutral-600">Created {fullDate(data.createdAt)}</p>
        </div>
      </article>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      {body}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">Shared read-only view</p>
        <a href="/" className="btn-alt btn-sm">
          Go to TaskBox <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
