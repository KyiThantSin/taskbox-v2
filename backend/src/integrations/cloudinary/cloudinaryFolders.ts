export const CLOUDINARY_FOLDERS = {
  cardAttachments: 'card-attachments',
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];
