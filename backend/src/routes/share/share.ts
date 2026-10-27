import { Router } from 'express';
import { shareController } from '../../controllers/share.controller';

const router = Router();

router.get('/:token', shareController.getShared);

export default router;
