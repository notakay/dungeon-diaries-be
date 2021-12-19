import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

import { Celebrate } from '../../../lib/celebrate';
import { getPostByIdSchema, createPostSchema } from '../schemas';
import { NotFoundError, BadRequestError } from '../../../utils/errors';

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
      const user_id: number | undefined = req.session.user?.userId;
      const { title = '', content = '', location = '', key = '' } = req.body;

      let image = '';

      // if uploading image, check db/cache
      if (key) {
        const result = await knex('upload_intents')
          .select('object_key')
          .where('session_id', req.sessionID)
          .first();

        // user could modify the location not much we can do, unless we're
        // getting a callback lambda directly when the image uploads
        if (result?.object_key === key && location.split('/').pop() === key) {
          image = location;
        } else {
          throw new BadRequestError('Error uploading image');
        }
      }

      const id: Array<number> = await knex('posts')
        .insert({ title, content, user_id, image })
        .returning('id');

      res.send(`Successfully created post with post id ${id}`);
    } catch (error: any) {
      next(error);
    }
  }
);

export { postsRouter };
