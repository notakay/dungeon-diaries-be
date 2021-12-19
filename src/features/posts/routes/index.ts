import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

import { Celebrate } from '../../../lib/celebrate';
import {
  getPostByIdSchema,
  createPostSchema,
  votePostSchema
} from '../schemas';
import { NotFoundError, BadRequestError } from '../../../utils/errors';

const postsRouter: Router = Router();
postsRouter.use(isLoggedIn);

const commentsCountSubquery = knex('comments')
  .count()
  .where('comments.post_id', knex.raw('??', 'posts.id'))
  .as('comment_count');

// Note on COALESCE(MAX(...), 0) https://stackoverflow.com/a/33849902
const voteSubquery = (req: Request) =>
  knex('post_votes')
    .select(knex.raw(`COALESCE(MAX(vote), 0)`))
    .where({
      'post_votes.post_id': knex.raw('??', 'posts.id'),
      'post_votes.user_id': knex.raw('??', req.session.user?.userId)
    })
    .as('user_vote');

postsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'posts.*',
        'users.username as author',
        'posts.user_id as author_id',
        commentsCountSubquery,
        voteSubquery(req)
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

    const record = await knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'users.username as author',
        'posts.user_id as author_id',
        'posts.*',
        commentsCountSubquery,
        voteSubquery(req)
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

postsRouter.post(
  '/vote/:postId',
  Celebrate(votePostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.session.user?.userId;
    const post_id = req.params.postId;

    const vote = req.body.vote ?? 0;

    const prevCountRes = await knex('post_votes')
      .select('vote')
      .where({ user_id, post_id })
      .first();

    const prevCount = prevCountRes?.vote ?? 0;

    await knex.transaction(async (trx) => {
      await trx('post_votes')
        .insert({ user_id, post_id, vote })
        .onConflict(['user_id', 'post_id'])
        .merge();

      const diff = vote - prevCount;
      const result = await trx('posts')
        .where({ id: post_id })
        .increment('votes', diff)
        .returning('votes');

      res.send({ post_id, votes: result[0] });
    });
  }
);

export { postsRouter };
