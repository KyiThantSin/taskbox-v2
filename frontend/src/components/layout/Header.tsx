import { Activity, Kanban, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { HeaderProps } from '../../types/board';
import UserProfileModal from '../auth/UserProfileModal';
import HealthIndicator from '../status/HealthIndicator';
import BoardSwitcher from './BoardSwitcher';

const TABS = [
  { key: 'boards', label: 'Boards', Icon: Kanban },
  { key: 'system', label: 'System', Icon: Activity },
] as const;

export default function Header({ view, onViewChange, boardId, onBoardChange }: HeaderProps) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b-2 border-black bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-black leading-none tracking-tighter sm:text-4xl">TaskBox</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {view === 'boards' && <BoardSwitcher boardId={boardId} onChange={onBoardChange} />}
          <HealthIndicator />
          <div role="tablist" aria-label="View" className="inline-flex overflow-hidden rounded-lg border-2 border-black">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={view === key}
                onClick={() => onViewChange(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold transition-colors duration-150 ${
                  view === key ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {user && (
            <>
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-2.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 transition-colors"
                title="View user profile"
              >
                <UserIcon size={14} aria-hidden="true" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>
              {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
