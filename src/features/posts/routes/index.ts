import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

import { Celebrate } from '../../../lib/celebrate';
import { getResourceURL } from '../../../lib/s3';
import { getPostByIdSchema, createPostSchema } from '../schemas';
import { NotFoundError } from '../../../utils/errors';

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
      const { title = '', content = '', cache_key } = req.body;

      let object_key = '';
      let image = '';
      if (cache_key) {
        // @ts-ignore
        object_key = await knex('upload_intents')
          .select('object_key')
          .where('object_key', cache_key);

        image = getResourceURL(object_key);
      }

      const id: Array<number> = await knex('posts')
        .insert({ title, content, user_id: userId, image })
        .returning('id');

      res.send(`Successfully created post with post id ${id}`);
    } catch (error: any) {
      next(error);
    }
  }
);

export { postsRouter };
