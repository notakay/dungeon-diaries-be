import Router from 'express';
import { usersRouter } from './users';

const apiRouter = Router();

apiRouter.use('/users', usersRouter);

export { apiRouter };
