import type { UploadedImage } from '../types/attachment';
import { isCloudinaryConfigured } from '../integrations/cloudinary/client';
import { CLOUDINARY_FOLDERS } from '../integrations/cloudinary/cloudinaryFolders';
import { deleteImage, uploadImage } from '../integrations/cloudinary/images';
import { attachmentRepository } from '../repositories/attachment.repository';
import { HttpError } from '../utils/errors';
import { isValidImage } from '../utils/images';
import { cardService } from './card.service';

const MAX_ATTACHMENTS_PER_CARD = 10;

export const attachmentService = {
  async uploadAttachment(cardId: number, file?: UploadedImage) {
    if (!file) throw new HttpError(400, 'Attach an image in the "image" field');
    if (!isValidImage(file)) throw new HttpError(400, 'File must be a JPEG, PNG, GIF or WebP image');

    await cardService.requireCard(cardId);
    const count = await attachmentRepository.countByCardId(cardId);
    if (count >= MAX_ATTACHMENTS_PER_CARD) {
      throw new HttpError(400, `A card can have at most ${MAX_ATTACHMENTS_PER_CARD} images`);
    }

    const uploaded = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.cardAttachments);
    try {
      const attachment = await attachmentRepository.create({
        cardId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        fileName: file.originalname.slice(0, 120),
      });

      // first image becomes the card cover automatically
      const rawCard = await cardService.getCardDetail(cardId);
      if (rawCard.coverAttachmentId === null) {
        await attachmentRepository.setCardCover(cardId, attachment.id);
      }
    } catch (err) {
      await deleteImage(uploaded.publicId).catch(() => undefined);
      throw err;
    }

    return cardService.getCardDetail(cardId);
  },

  async deleteAttachment(id: number) {
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) throw new HttpError(404, 'Attachment not found');

    if (isCloudinaryConfigured) {
      await deleteImage(attachment.publicId).catch((err: unknown) =>
        console.error('[cloudinary] could not delete image:', err instanceof Error ? err.message : err),
      );
    }

    await attachmentRepository.delete(id);
    await attachmentRepository.clearCardCoverIfMatching(attachment.cardId, id);

    return cardService.getCardDetail(attachment.cardId);
  },
};
