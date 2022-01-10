import Router from 'express';
import config from '../../config';
import { authRouter } from '../features/auth/routes';
import { commentsRouter } from '../features/comments/routes';
import { postsRouter } from '../features/posts/routes';
import { uploadsRouter } from '../features/uploads/routes';
import { usersRouter } from '../features/users/routes';

const apiRouter = Router();

apiRouter.get('/health-check', (_req, res) => res.send('OK'));
apiRouter.get('/prod-check', (_req, res) => res.json(config.frontendUrl));
apiRouter.use('/auth', authRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/uploads', uploadsRouter);

export { apiRouter };
