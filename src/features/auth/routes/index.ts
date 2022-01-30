import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Celebrate } from '../../../lib/celebrate';

import { knex } from '../../../config';
import * as dbHelper from '../../../utils/db/helpers';
import { BadRequestError } from '../../../utils/errors';
import { registerSchema, loginSchema } from '../schemas';
import { sanitizeUser } from '../../users/transforms';

const authRouter: Router = Router();

authRouter.post(
  '/register',
  Celebrate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      const usernameExists: boolean = await dbHelper.existsInTable(
        'users',
        'username',
        username
      );

      if (usernameExists) {
        throw new BadRequestError('Username is already taken');
      }

      const emailExists: boolean = await dbHelper.existsInTable(
        'users',
        'email',
        email
      );
      if (emailExists) {
        throw new BadRequestError('Email is already taken');
      }

      const hash: string = await bcrypt.hash(password, 10);

      const [user] = await knex('users')
        .insert({ username, email, password_hash: hash })
        .returning('*');

      req.session.user = { userId: user.id, isLoggedIn: true };

      res.json(sanitizeUser(user));
    } catch (error: any) {
      next(error);
    }
  }
);

authRouter.post(
  '/login',
  Celebrate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const record = await knex('users')
        .select('id', 'username', 'email', 'password_hash')
        .where('email', email)
        .first();

      if (!record) throw new BadRequestError('User with email does not exist');

      const isValidPassword = await bcrypt.compare(
        password,
        record.password_hash
      );

      if (!isValidPassword) throw new BadRequestError('Invalid password');
      req.session.user = { userId: record.id, isLoggedIn: true };

      // Although we can just return username, email from the request body, I think a query is more suitable here as we extend the user to include more fields like bio etc.
      const user = await knex('users')
        .select('*')
        .where('id', record.id)
        .first();
      res.json(sanitizeUser(user));
    } catch (error: any) {
      next(error);
    }
  }
);

authRouter.post(
  '/logout',
  (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      }
      res.status(200).send();
    });
  }
);

export { authRouter };
