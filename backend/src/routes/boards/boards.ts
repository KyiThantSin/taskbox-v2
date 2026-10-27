import { Router } from 'express';
import { boardController } from '../../controllers/board.controller';
import { listController } from '../../controllers/list.controller';
import { labelController } from '../../controllers/label.controller';

const router = Router();

router.get('/', boardController.getAll);
router.post('/', boardController.create);
router.get('/:id', boardController.getById);
router.patch('/:id', boardController.update);
router.delete('/:id', boardController.delete);
router.get('/:id/export', boardController.export);

// sub-resources under boards
router.post('/:id/lists', listController.create);
router.post('/:id/labels', labelController.create);

export default router;
