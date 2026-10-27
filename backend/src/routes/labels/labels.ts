import { Router } from 'express';
import { labelController } from '../../controllers/label.controller';

const router = Router();

router.patch('/:id', labelController.update);
router.delete('/:id', labelController.delete);

export default router;
