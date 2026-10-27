import { Router } from 'express';
import { commentController } from '../../controllers/comment.controller';

const router = Router();

router.delete('/:id', commentController.delete);

export default router;
