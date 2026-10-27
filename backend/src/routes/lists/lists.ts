import { Router } from 'express';
import { listController } from '../../controllers/list.controller';
import { cardController } from '../../controllers/card.controller';

const router = Router();

router.patch('/:id', listController.update);
router.post('/:id/move', listController.move);
router.delete('/:id', listController.delete);

// cards created in a list
router.post('/:id/cards', cardController.create);

export default router;
