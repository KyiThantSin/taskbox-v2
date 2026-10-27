import { Router } from 'express';
import { checklistController } from '../../controllers/checklist.controller';

const router = Router();

router.patch('/:id', checklistController.update);
router.delete('/:id', checklistController.delete);

export default router;
