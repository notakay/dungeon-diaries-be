import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';
import { NotFoundError } from '../../../utils/errors';
import { getPostByIdSchema, createPostSchema } from '../schemas';
import { Celebrate } from '../../../lib/celebrate';

const postsRouter: Router = Router();

postsRouter.use(isLoggedIn);

postsRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    const posts = await knex('posts')
      .select('*')
      .orderBy('created_at', 'desc')
      .catch((error) => next(error));
    res.json({ posts: posts });
  }
);

postsRouter.get(
  '/:postId',
  Celebrate(getPostByIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const record = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select('users.username', 'posts.*')
      .where('posts.id', postId)
      .first()
      .catch((error) => next(error));
    if (!record) {
      return next(new NotFoundError(`Post with id ${postId} not found`));
    }
    res.send(record);
  }
);

postsRouter.post(
  '/',
  Celebrate(createPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: number = req.session.user?.userId;

      const { title, content } = req.body;

      const id: Array<number> = await knex('posts')
        .insert({ title, content, user_id: userId })
        .returning('id');

      res.send(`Successfully created post with post id ${id}`);
    } catch (error: any) {
      next(error);
    }
  }
);

export { postsRouter };
