import { Router } from 'express';
import { attachmentController } from '../../controllers/attachment.controller';

const router = Router();

router.delete('/:id', attachmentController.delete);

export default router;
