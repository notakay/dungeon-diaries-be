import Router from 'express';
import { authRouter } from './auth';
import { postsRouter } from './posts';
import { usersRouter } from './users';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);

export { apiRouter };
