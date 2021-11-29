import { Router } from 'express';

import knex from '../../knex/knex';
import { isLoggedIn } from '../middleware/auth';

const postsRouter: Router = Router();

postsRouter.use(isLoggedIn);

postsRouter.get('/:postId', async (req, res, next) => {
  try {
    const record = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select('users.username', 'posts.*')
      .where('posts.id', req.params.postId)
      .first();
    res.send(record);
  } catch (error) {
    next(error);
  }
});

postsRouter.post('/', async (req, res, next) => {
  try {
    // isLoggedIn middleware should ensure that userId is not undefined
    const userId: number | undefined = req.session.user?.userId;
    if (!userId) throw Error('An error as occured, userId is undefined');

    const { title = '', description = '' } = req.body;
    if (!title) throw Error('Title cannot be null');

    const id: Array<number> = await knex('posts')
      .insert({ title, description, user_id: userId })
      .returning('id');

    res.send(`Successfully created post with post id ${id}`);
  } catch (error: any) {
    next(error);
  }
});

export { postsRouter };
