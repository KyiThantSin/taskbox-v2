import { AlertTriangle, Trash2, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ConfirmFunction, ConfirmOptions, ConfirmProviderProps } from '../../types/common';

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export function useConfirm(): ConfirmFunction {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const normalizedOptions: ConfirmOptions =
        typeof options === 'string'
          ? { message: options, title: 'Confirm deletion', isDestructive: true }
          : { isDestructive: true, ...options };
      setDialogState({ isOpen: true, options: normalizedOptions, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    if (dialogState) {
      dialogState.resolve(result);
      setDialogState(null);
    }
  }, [dialogState]);

  useEffect(() => {
    if (!dialogState?.isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus cancel button by default for safety on destructive actions
    setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [dialogState?.isOpen, handleClose]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialogState?.isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleClose(false);
          }}
          role="presentation"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
            className="card relative my-auto w-full max-w-md animate-slide-in bg-white p-6 outline-none"
          >
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="btn-alt btn-sm absolute right-4 top-4"
              aria-label="Close dialog"
            >
              <X size={14} aria-hidden="true" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-neutral-100">
                {dialogState.options.isDestructive ? (
                  <Trash2 size={20} className="text-black" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={20} className="text-black" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 id="confirm-modal-title" className="text-lg font-black tracking-tight text-black">
                  {dialogState.options.title || 'Are you sure?'}
                </h3>
                <p id="confirm-modal-message" className="mt-2 text-sm text-neutral-600 break-words leading-relaxed">
                  {dialogState.options.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => handleClose(false)}
                className="btn-alt btn-sm px-4 py-2 text-xs"
              >
                {dialogState.options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className="btn btn-sm px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                {dialogState.options.isDestructive && <Trash2 size={13} aria-hidden="true" />}
                {dialogState.options.confirmText || (dialogState.options.isDestructive ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
