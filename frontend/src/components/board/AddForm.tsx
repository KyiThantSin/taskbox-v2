import { Plus, X } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useRef, useState } from 'react';
import type { AddFormProps } from '../../types/board';
import ErrorLine from '../common/ErrorLine';

export default function AddForm({ label, placeholder, maxLength, onSubmit, tone = 'plain' }: AddFormProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setText('');
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(text.trim());
      setText(''); 
      inputRef.current?.focus();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${tone === 'solid' ? 'btn' : 'btn-alt'} w-full justify-start`}
      >
        <Plus size={16} aria-hidden="true" /> {label}
      </button>
    );
  }

  return (
    <form onSubmit={submit} onKeyDown={onKey} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        autoFocus
        className="input py-1.5 text-sm"
        value={text}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-sm" disabled={!text.trim() || busy}>
          {busy ? 'Adding…' : 'Add'}
        </button>
        <button type="button" className="btn-alt btn-sm" onClick={close} aria-label="Cancel">
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      {error != null && <ErrorLine error={error} />}
    </form>
  );
}
