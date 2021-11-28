import { Router } from 'express';
import bcrypt from 'bcrypt';

import knex from '../../knex/knex';

const authRouter: Router = Router();

const existsInTable: (
  table: string,
  column: string,
  value: string
) => Promise<boolean> = async (table, column, value) => {
  return knex(table)
    .select('id')
    .where(column, value)
    .first()
    .then((record) => {
      if (!record) return false;
      return true;
    });
};

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernameExists: boolean = await existsInTable(
      'users',
      'username',
      username
    );

    if (usernameExists) {
      res.send('Username is already taken');
      return;
    }

    const emailExists: boolean = await existsInTable('users', 'email', email);
    if (emailExists) {
      res.send('Email is already taken');
      return;
    }

    const passwordHash: string = await bcrypt.hash(password, 10);

    const id: Array<number> = await knex('users')
      .insert({ username, email, password: passwordHash })
      .returning('id');

    res.send(`Successfully created user with user id ${id}`);
  } catch (error: any) {
    res.send(
      `Caught Error: ${error.message}` ??
        `Error in POST /api/auth/register: ${req.body ?? ''}`
    );
  }
});

export { authRouter };
