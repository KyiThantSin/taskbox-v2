import type { DragEvent, RefObject } from 'react';
import type { CardSummary } from './card';
import type { Label } from './label';

export type DueFilter = 'any' | 'overdue' | 'soon' | 'none';

export interface CardFilters {
  text: string;
  labelId: number | null;
  due: DueFilter;
}

export interface ListWithCards {
  id: number;
  title: string;
  position: number;
  cards: CardSummary[];
}

export interface Board {
  id: number;
  title: string;
  labels: Label[];
  lists: ListWithCards[];
}

export interface BoardSummary {
  id: number;
  title: string;
  cardCount: number;
}

export type DragKind = 'card' | 'list';

export type Drag = { type: DragKind; id: number } | null;

export type BoardTransform = (board: Board) => Board;

export type BoardLayout = 'board' | 'table';

export type View = 'boards' | 'system';

export interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  boardId: number | null;
  onBoardChange: (id: number | null) => void;
}

export interface BoardSwitcherProps {
  boardId: number | null;
  onChange: (id: number | null) => void;
}

export interface BoardToolbarProps {
  boardId: number;
  title: string;
  cardCount: number;
  overdue: number;
  layout: BoardLayout;
  onLayout: (l: BoardLayout) => void;
  onDeleted: () => void;
}

export interface ListColumnProps {
  boardId: number;
  list: ListWithCards;
  visibleCards: CardSummary[];
  labels: Label[];
  drag: Drag;
  dragEnabled: boolean;
  dropIndex: number | null;
  onOpenCard: (id: number) => void;
  onCardDragStart: (e: DragEvent<HTMLElement>, id: number) => void;
  onListDragStart: (e: DragEvent<HTMLElement>, id: number) => void;
  onDragEnd: () => void;
  onCardDragOver: (e: DragEvent<HTMLElement>, listId: number) => void;
  onCardDrop: (e: DragEvent<HTMLElement>, listId: number) => void;
  onCardDragLeave: (e: DragEvent<HTMLElement>, listId: number) => void;
}

export interface AddFormProps {
  label: string;
  placeholder: string;
  maxLength: number;
  onSubmit: (text: string) => Promise<unknown>;
  tone?: 'plain' | 'solid';
}

export interface FilterBarProps {
  filters: CardFilters;
  onChange: (f: CardFilters) => void;
  labels: Label[];
  searchRef: RefObject<HTMLInputElement>;
}

export interface BoardViewProps {
  boardId: number;
  onOpenCard: (id: number) => void;
  onBoardDeleted: () => void;
}

export interface UseBoardDndOptions {
  boardKey: readonly unknown[];
  dragEnabled: boolean;
}

export interface BoardCanvasProps {
  board: Board;
  visibleIds: Set<number>;
  drag: Drag;
  dragEnabled: boolean;
  dropCard: CardDropTarget | null;
  dropListIndex: number | null;
  onOpenCard: (id: number) => void;
  onCardDragStart: (e: DragEvent<HTMLElement>, id: number) => void;
  onListDragStart: (e: DragEvent<HTMLElement>, id: number) => void;
  onDragEnd: () => void;
  onCardDragOver: (e: DragEvent<HTMLElement>, listId: number) => void;
  onCardDrop: (e: DragEvent<HTMLElement>, listId: number) => void;
  onCardDragLeave: (e: DragEvent<HTMLElement>, listId: number) => void;
  onBoardDragOver: (e: DragEvent<HTMLElement>) => void;
  onBoardDrop: (e: DragEvent<HTMLElement>) => void;
  onAddList: (title: string) => Promise<unknown>;
}

export type SortKey = 'title' | 'list' | 'due' | 'checklist';

export interface TableRow {
  card: CardSummary;
  listTitle: string;
  listIndex: number;
}

export interface TableViewProps {
  board: Board;
  cards: CardSummary[];
  onOpenCard: (id: number) => void;
}

export interface DueFilterOption {
  value: DueFilter;
  label: string;
}

export interface CardDropTarget {
  listId: number;
  index: number;
}

export interface BoardMutationContext {
  previous?: Board;
}

export interface MoveCardInput {
  cardId: number;
  listId: number;
  index: number;
}
