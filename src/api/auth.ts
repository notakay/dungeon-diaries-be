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

    const hash: string = await bcrypt.hash(password, 10);

    const id: Array<number> = await knex('users')
      .insert({ username, email, password_hash: hash })
      .returning('id');

    res.send(`Successfully created user with user id ${id}`);
  } catch (error: any) {
    res.send(
      `Caught Error: ${error.message}` ??
        `Error in POST /api/auth/register: ${req.body ?? ''}`
    );
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const record = await knex('users')
      .select('id', 'username', 'email', 'password_hash')
      .where('email', email)
      .first();

    if (!record) throw Error('User with email does not exist');

    const isValidPassword = await bcrypt.compare(
      password,
      record.password_hash
    );

    if (!isValidPassword) throw Error('Invalid password');

    res.send('Success');
  } catch (error: any) {
    res.send(`Error logging in ${error.message}`);
  }
});

export { authRouter };
