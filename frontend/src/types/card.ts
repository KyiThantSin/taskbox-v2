import type { QueryClient } from '@tanstack/react-query';
import type { DragEvent } from 'react';
import type { Board } from './board';
import type { Label, LabelStyle } from './label';

export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  user?: { id: number; name: string; email?: string } | null;
}

export interface Attachment {
  id: number;
  url: string;
  fileName: string;
  createdAt: string;
}

export interface CardSummary {
  id: number;
  listId: number;
  title: string;
  position: number;
  dueDate: string | null; // YYYY-MM-DD
  completed: boolean;
  labelIds: number[];
  checklist: { total: number; done: number };
  attachmentCount: number;
  commentCount: number;
  hasDescription: boolean;
  coverUrl: string | null;
  shared: boolean;
  author?: { id: number; name: string } | null;
}

export interface CardDetail {
  id: number;
  title: string;
  description: string | null;
  listId: number;
  listTitle: string;
  boardId: number;
  dueDate: string | null;
  completed: boolean;
  labelIds: number[];
  coverAttachmentId: number | null;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  author?: { id: number; name: string; email?: string } | null;
}

export interface CardPatch {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
  coverAttachmentId?: number | null;
}

export interface SharedCard {
  title: string;
  description: string | null;
  listTitle: string;
  dueDate: string | null;
  completed: boolean;
  labels: { name: string; style: LabelStyle }[];
  checklist: { text: string; done: boolean }[];
  images: { url: string }[];
  coverUrl: string | null;
  createdAt: string;
}

export interface CardTileProps {
  card: CardSummary;
  labels: Label[];
  dragging: boolean;
  onOpen: (id: number) => void;
  onDragStart: (e: DragEvent<HTMLElement>, id: number) => void;
  onDragEnd: () => void;
}

export interface CardModalProps {
  cardId: number;
  onClose: () => void;
}

export interface DueBadgeProps {
  dueDate: string | null;
  completed: boolean;
  size?: 'sm' | 'md';
}

export interface ChecklistSectionProps {
  card: CardDetail;
}

export interface CommentsSectionProps {
  card: CardDetail;
}

export interface AttachmentsSectionProps {
  card: CardDetail;
}

export interface CardContentProps {
  card: CardDetail;
  board: Board | undefined;
  onClose: () => void;
  queryClient: QueryClient;
}

export interface SharedViewProps {
  token: string;
}

export interface DueInfo {
  date: string; // YYYY-MM-DD
  label: string; 
  overdue: boolean; 
  soon: boolean; 
}

export interface ChecklistToggleInput {
  id: number;
  done: boolean;
}

export interface ChecklistPatch {
  text?: string;
  done?: boolean;
}
