import type { CardDetail } from './card';

export type LabelStyle = 'solid' | 'striped' | 'dotted' | 'outline' | 'gray';

export interface Label {
  id: number;
  name: string;
  style: LabelStyle;
}

export interface LabelChipProps {
  name: string;
  compact?: boolean;
}

export interface LabelPickerProps {
  card: CardDetail;
  labels: Label[];
  boardId: number;
}

export interface LabelToggleInput {
  labelId: number;
  on: boolean;
}

export interface LabelPatch {
  name?: string;
  style?: LabelStyle;
}
