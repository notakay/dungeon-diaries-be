import Router from 'express';
import { authRouter } from './auth';
import { postsRouter } from './posts';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/posts', postsRouter);

export { apiRouter };
