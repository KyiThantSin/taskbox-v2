import multer from 'multer';
import { MAX_IMAGE_BYTES } from '../config/uploads';

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});
