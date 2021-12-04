import Router from 'express';
import { authRouter } from '../features/auth/routes';
import { postsRouter } from '../features/posts/routes';
import { usersRouter } from '../features/users/routes';

const apiRouter = Router();

apiRouter.get('/health-check', (_req, res) => res.send('OK'));
apiRouter.use('/auth', authRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);

export { apiRouter };
