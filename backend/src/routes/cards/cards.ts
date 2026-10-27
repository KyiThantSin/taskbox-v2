import { Router } from 'express';
import { attachmentController } from '../../controllers/attachment.controller';
import { cardController } from '../../controllers/card.controller';
import { checklistController } from '../../controllers/checklist.controller';
import { commentController } from '../../controllers/comment.controller';
import { labelController } from '../../controllers/label.controller';
import { shareController } from '../../controllers/share.controller';
import { imageUpload } from '../../middlewares/upload';

const router = Router();

router.get('/:id', cardController.getById);
router.patch('/:id', cardController.update);
router.post('/:id/move', cardController.move);
router.delete('/:id', cardController.delete);

// card labels
router.put('/:id/labels/:labelId', labelController.addToCard);
router.delete('/:id/labels/:labelId', labelController.removeFromCard);

// card checklist
router.post('/:id/checklist', checklistController.create);

// card comments
router.post('/:id/comments', commentController.create);

// card attachments
router.post(
  '/:id/attachments',
  imageUpload.single('image'),
  attachmentController.upload,
);

// card share links
router.post('/:id/share', shareController.createToken);
router.delete('/:id/share', shareController.revokeToken);

export default router;
