import { Router } from 'express';

import knex from '../../knex/knex';
import { isLoggedIn } from '../middleware/auth';
import { sanitizeUser } from '../transforms/user';

const usersRouter: Router = Router();

usersRouter.use(isLoggedIn);

usersRouter.get('/me', async (req, res, next) => {
  const userId: number = req.session.user?.userId;

  const user = await knex('users').select('*').where('id', userId).first();

  res.json(sanitizeUser(user));
});

export { usersRouter };
