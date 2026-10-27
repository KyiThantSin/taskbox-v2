import { ALLOWED_IMAGE_TYPES } from '../config/uploads';
import type { UploadedImage } from '../types/attachment';

export function isValidImage(file: UploadedImage): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.mimetype);
}
