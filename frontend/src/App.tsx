import { boardService } from './services/boardService';
import type { BoardSummary, View } from './types/board';
import { useQuery } from '@tanstack/react-query';
import { SquareCheckBig } from 'lucide-react';
import { useCallback, useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import CardModal from './components/card/CardModal';
import EmptyState from './components/common/EmptyState';
import Spinner from './components/common/Spinner';
import Header from './components/layout/Header';
import { useAuth } from './context/AuthContext';
import BoardView from './pages/BoardView/BoardView';
import SharedView from './pages/SharedView/SharedView';
import SystemView from './pages/SystemView/SystemView';
import { storage } from './utils';

const BOARD_KEY = 'taskbox.boardId';

export default function App() {
  const shareToken = new URLSearchParams(window.location.search).get('share');
  if (shareToken) return <SharedView token={shareToken} />;
  return <AuthGate />;
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Spinner label="Checking session…" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <header className="sticky top-0 z-20 border-b-2 border-black bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-black text-white">
                <SquareCheckBig size={24} strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-black leading-none tracking-tight">TaskBox</h1>
              </div>
            </div>
            <span className="font-mono text-xs text-neutral-500">Sign in to continue</span>
          </div>
        </header>
        <main className="mx-auto max-w-md py-6">
          <AuthModal />
        </main>
      </>
    );
  }

  return <Main />;
}

function Main() {
  const [view, setView] = useState<View>('boards');
  const [boardId, setBoardId] = useState<number | null>(() => {
    const saved = Number(storage.get(BOARD_KEY));
    return Number.isInteger(saved) && saved > 0 ? saved : null;
  });
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const { data: boards, isSuccess } = useQuery<BoardSummary[]>({ queryKey: ['boards'], queryFn: boardService.listBoards });

  const changeBoard = useCallback((id: number | null) => {
    setBoardId(id);
    setOpenCardId(null);
    if (id !== null) storage.set(BOARD_KEY, String(id));
  }, []);
  const closeCard = useCallback(() => setOpenCardId(null), []);

  return (
    <>
      <Header view={view} onViewChange={setView} boardId={boardId} onBoardChange={changeBoard} />
      <main className="mx-auto max-w-[110rem] px-4 py-6">
        {view === 'system' ? (
          <SystemView enabled />
        ) : boardId !== null ? (
          <BoardView key={boardId} boardId={boardId} onOpenCard={setOpenCardId} onBoardDeleted={() => changeBoard(null)} />
        ) : isSuccess && boards.length === 0 ? (
          <EmptyState variant="boards">
            <p className="font-mono text-xs text-neutral-600">Use "New board" in the header.</p>
          </EmptyState>
        ) : null}
      </main>
      {openCardId !== null && view === 'boards' && <CardModal cardId={openCardId} onClose={closeCard} />}
    </>
  );
}
