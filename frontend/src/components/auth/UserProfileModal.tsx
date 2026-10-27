import { Calendar, LogOut, Mail, User as UserIcon, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserProfileModalProps } from '../../types/auth';
import { fullDate } from '../../utils';

export default function UserProfileModal({ onClose }: UserProfileModalProps): JSX.Element | null {
  const { user, logout } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!user) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="User Profile"
        className="card relative my-auto w-full max-w-sm animate-slide-in bg-white p-6 outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-alt btn-sm absolute right-4 top-4"
          aria-label="Close profile"
        >
          <X size={14} aria-hidden="true" />
        </button>

        <header className="mb-5">
          <span className="label">Account</span>
          <h2 className="text-xl font-black tracking-tight text-black">User Profile</h2>
        </header>

        <div className="flex flex-col gap-3 rounded-lg border-2 border-black bg-neutral-50 p-4">
          <div className="flex items-center gap-2.5">
            <UserIcon size={16} className="text-neutral-500 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Name
              </span>
              <span className="block font-bold text-black truncate">{user.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-t border-neutral-200 pt-2.5">
            <Mail size={16} className="text-neutral-500 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Email
              </span>
              <span className="block font-mono text-xs text-neutral-800 truncate">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-t border-neutral-200 pt-2.5">
            <Calendar size={16} className="text-neutral-500 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Joined
              </span>
              <span className="block font-mono text-xs text-neutral-800">
                {fullDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={async () => {
              onClose();
              await logout();
            }}
            className="btn btn-sm w-full inline-flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} aria-hidden="true" /> Log out
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
