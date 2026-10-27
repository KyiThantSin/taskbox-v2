import { Router } from 'express';
import authRouter from './auth/auth';
import boardsRouter from './boards/boards';
import listsRouter from './lists/lists';
import cardsRouter from './cards/cards';
import labelsRouter from './labels/labels';
import checklistRouter from './checklist/checklist';
import commentsRouter from './comments/comments';
import attachmentsRouter from './attachments/attachments';
import shareRouter from './share/share';
import systemRouter from './system/system';
import { requireAuth } from '../middlewares/auth';

const gateway = Router();

gateway.use('/auth', authRouter);
gateway.use('/shared', shareRouter);
gateway.use('/', systemRouter);
gateway.use('/boards', requireAuth, boardsRouter);
gateway.use('/lists', requireAuth, listsRouter);
gateway.use('/cards', requireAuth, cardsRouter);
gateway.use('/labels', requireAuth, labelsRouter);
gateway.use('/checklist', requireAuth, checklistRouter);
gateway.use('/comments', requireAuth, commentsRouter);
gateway.use('/attachments', requireAuth, attachmentsRouter);

gateway.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default gateway;
