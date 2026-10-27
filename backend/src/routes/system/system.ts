import { Router } from 'express';
import { systemController } from '../../controllers/system.controller';

const router = Router();

router.get('/health', systemController.getHealth);
router.get('/info', systemController.getInfo);
router.get('/config', systemController.getConfig);

export default router;
