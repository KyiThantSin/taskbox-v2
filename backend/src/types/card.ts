export interface CardUpdateInput {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  completed?: boolean;
  coverAttachmentId?: number | null;
}
