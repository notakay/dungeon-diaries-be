import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';
import { sanitizeUser } from '../transforms';

const usersRouter: Router = Router();

usersRouter.use(isLoggedIn);

usersRouter.get(
  '/me',
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId: number = req.session.user?.userId;

    const user = await knex('users').select('*').where('id', userId).first();

    res.json(sanitizeUser(user));
  }
);

export { usersRouter };
