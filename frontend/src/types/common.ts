import type { ReactNode } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export type ConfirmFunction = (options: ConfirmOptions | string) => Promise<boolean>;

export type EmptyStateVariant = 'board' | 'filter' | 'boards';

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  children?: ReactNode;
}

export interface ConfirmProviderProps {
  children: ReactNode;
}

export interface ErrorLineProps {
  error: unknown;
  onRetry?: () => void;
}

export interface ErrorCardProps {
  onRetry: () => void;
  text?: string;
}

export interface SpinnerProps {
  label?: string;
}
