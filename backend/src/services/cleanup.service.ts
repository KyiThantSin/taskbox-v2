import type { Prisma } from '@prisma/client';
import { attachmentRepository } from '../repositories/attachment.repository';
import { isCloudinaryConfigured } from '../integrations/cloudinary/client';
import { deleteImages } from '../integrations/cloudinary/images';

export async function purgeImages(where: Prisma.AttachmentWhereInput): Promise<void> {
  if (!isCloudinaryConfigured) return;
  try {
    const rows = await attachmentRepository.findManyByWhere(where);
    await deleteImages(rows.map((r) => r.publicId));
  } catch (err) {
    console.error('[cloudinary] could not delete images:', err instanceof Error ? err.message : err);
  }
}
