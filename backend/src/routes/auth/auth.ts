import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export default router;
