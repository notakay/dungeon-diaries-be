import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

import { getPostByIdSchema, createPostSchema } from '../schemas';
import { Celebrate } from '../../../lib/celebrate';
import { BadRequestError, NotFoundError } from '../../../utils/errors';

const postsRouter: Router = Router();

postsRouter.use(isLoggedIn);

postsRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    const commentsCountSubquery = knex('comments')
      .count()
      .where('comments.post_id', knex.raw('??', 'posts.id'))
      .as('comment_count');

    const posts = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'posts.*',
        'users.username as author',
        'posts.user_id as author_id',
        commentsCountSubquery
      )
      .orderBy('posts.created_at', 'desc');

    res.json({ posts: posts });
  }
);

postsRouter.get(
  '/:postId',
  Celebrate(getPostByIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const commentsCountSubquery = knex('comments')
      .count()
      .where('comments.post_id', knex.raw('??', 'posts.id'))
      .as('comment_count');

    const record = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'users.username as author',
        'posts.user_id as author_id',
        'posts.*',
        commentsCountSubquery
      )
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
      // isLoggedIn middleware should ensure that userId is not undefined
      const userId: number | undefined = req.session.user?.userId;
      if (!userId)
        throw new BadRequestError('An error as occured, userId is undefined');

      const { title = '', content = '' } = req.body;
      if (!title) throw new BadRequestError('Title cannot be null');

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
