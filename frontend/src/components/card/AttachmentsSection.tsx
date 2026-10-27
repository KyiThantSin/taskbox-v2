import { attachmentService } from '../../services/attachmentService';
import { cardService } from '../../services/cardService';
import type { AttachmentsSectionProps } from '../../types/card';
import { ExternalLink, ImageIcon, ImageOff, Star, StarOff, Trash2, Upload } from 'lucide-react';
import type { DragEvent } from 'react';
import { useRef, useState } from 'react';
import { useAppConfig, useCardAction } from '../../hooks';
import { formatBytes } from '../../utils';
import { useConfirm } from '../common/ConfirmModal';
import ErrorLine from '../common/ErrorLine';
import { MiniSpinner } from '../common/Spinner';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function AttachmentsSection({ card }: AttachmentsSectionProps) {
  const { data: config } = useAppConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const confirm = useConfirm();
  const upload = useCardAction(card.id, (file: File) => attachmentService.uploadImage(card.id, file));
  const remove = useCardAction(card.id, (id: number) => attachmentService.deleteAttachment(id));
  const setCover = useCardAction(card.id, (id: number | null) => cardService.patchCard(card.id, { coverAttachmentId: id }));

  const onDeleteImage = async (id: number) => {
    const ok = await confirm({
      title: 'Delete image',
      message: 'Delete this image attachment? This cannot be undone.',
      confirmText: 'Delete image',
      isDestructive: true,
    });
    if (ok) remove.mutate(id);
  };

  const send = (file: File | undefined) => {
    setClientError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setClientError('Choose a JPEG, PNG, GIF or WebP image.');
    if (config && file.size > config.maxImageBytes) return setClientError(`Image is too large (max ${formatBytes(config.maxImageBytes)}).`);
    upload.mutate(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    send(e.dataTransfer.files[0]);
  };

  const enabled = config?.uploadsEnabled === true;

  return (
    <section aria-labelledby="images-h">
      <h3 id="images-h" className="label mb-2 flex items-center gap-1.5"><ImageIcon size={14} aria-hidden="true" /> Images ({card.attachments.length})</h3>

      {card.attachments.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {card.attachments.map((a) => {
            const isCover = a.id === card.coverAttachmentId;
            return (
              <li key={a.id} className="overflow-hidden rounded-lg border-2 border-black bg-white">
                <a href={a.url} target="_blank" rel="noreferrer" title={`Open ${a.fileName}`}>
                  <img src={a.url} alt={a.fileName} loading="lazy" className="h-24 w-full object-cover" />
                </a>
                <div className="flex items-center justify-between gap-1 border-t-2 border-black p-1">
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-neutral-200"
                    aria-pressed={isCover}
                    title={isCover ? 'Remove as cover' : 'Make cover'}
                    aria-label={isCover ? 'Remove as cover' : 'Make cover'}
                    onClick={() => setCover.mutate(isCover ? null : a.id)}
                  >
                    {isCover ? <Star size={15} fill="currentColor" aria-hidden="true" /> : <StarOff size={15} aria-hidden="true" />}
                  </button>
                  <a className="rounded p-1 hover:bg-neutral-200" href={a.url} target="_blank" rel="noreferrer" aria-label="Open image in a new tab" title="Open">
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-neutral-200"
                    aria-label="Delete image"
                    title="Delete"
                    onClick={() => onDeleteImage(a.id)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {enabled ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-black p-4 text-center ${dragOver ? 'bg-neutral-200' : 'bg-white'}`}
        >
          {upload.isPending ? (
            <p className="inline-flex items-center gap-2 font-mono text-xs"><MiniSpinner /> Uploading…</p>
          ) : (
            <>
              <Upload size={20} aria-hidden="true" />
              <p className="text-sm">Drop an image here or</p>
              <button type="button" className="btn btn-sm" onClick={() => inputRef.current?.click()}>Choose image</button>
              <p className="font-mono text-[11px] text-neutral-600">JPEG, PNG, GIF or WebP · max {formatBytes(config?.maxImageBytes ?? 5242880)}</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="sr-only"
            aria-label="Choose an image to upload"
            onChange={(e) => {
              send(e.target.files?.[0]);
              e.target.value = ''; // allow choosing the same file again
            }}
          />
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-lg border-2 border-dashed border-neutral-400 p-3 font-mono text-xs text-neutral-600">
          <ImageOff size={16} className="shrink-0" aria-hidden="true" />
          Image uploads are off. Add your Cloudinary keys to .env and restart the api container to turn them on.
        </p>
      )}

      {(clientError || upload.error || remove.error || setCover.error) && (
        <div className="mt-2">
          {clientError ? <p role="alert" className="border-l-4 border-black pl-2 font-mono text-xs">✕ {clientError}</p> : <ErrorLine error={upload.error ?? remove.error ?? setCover.error} />}
        </div>
      )}
    </section>
  );
}
