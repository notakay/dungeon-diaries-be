import { Router } from 'express';
import bcrypt from 'bcrypt';

import knex from '../../knex/knex';

const usersRouter: Router = Router();
usersRouter.post('/create', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernamesList = await knex
      .select('username')
      .from('users')
      .where('username', username)
      .orWhere('email', email);

    if (usernamesList.length > 0) {
      console.log(`Error creating user with ${username}, ${email}`);
      throw { message: 'Username or email has already been taken' };
    }

    const passwordHash: string = await bcrypt.hash(password, 10);
    const id: string = await knex('users')
      .insert({ username, email, password: passwordHash })
      .returning('id');

    res.send(`Successfully created user with user id ${id}`);
  } catch (error: any) {
    res.send(
      error.message ?? `Error in POST /api/create/users ${req.body ?? ''}`
    );
  }
});

export { usersRouter };
