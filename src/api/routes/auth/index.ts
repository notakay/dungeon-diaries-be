import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import knex from '../../../../knex/knex';

import * as dbHelper from '../../../utils/db/helpers';
import { BadRequestError } from '../../../utils/errors';
import { validate } from '../../../middleware/validate';

import { registerSchema, loginSchema } from './schemas';

const authRouter: Router = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
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

      const id: Array<number> = await knex('users')
        .insert({ username, email, password_hash: hash })
        .returning('id');

      res.send(`Successfully created user with user id ${id}`);
    } catch (error: any) {
      next(error);
    }
  }
);

authRouter.post(
  '/login',
  validate(loginSchema),
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

      res.send('Success');
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
