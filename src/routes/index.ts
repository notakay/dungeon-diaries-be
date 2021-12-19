import Router from 'express';
import { authRouter } from '../features/auth/routes';
import { commentsRouter } from '../features/comments/routes';
import { postsRouter } from '../features/posts/routes';
import { uploadsRouter } from '../features/uploads/routes';
import { usersRouter } from '../features/users/routes';
import { voteRouter } from '../features/vote/routes';

const apiRouter = Router();

apiRouter.get('/health-check', (_req, res) => res.send('OK'));
apiRouter.use('/auth', authRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/uploads', uploadsRouter);
apiRouter.use('/vote', voteRouter);

export { apiRouter };
