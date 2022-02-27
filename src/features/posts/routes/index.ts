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
import redisClient from '../../../utils/redis/client';

import PostsModel from '../../../models/posts';

const postsRouter: Router = Router();
const PAGE_SIZE = 10;

postsRouter.use(isLoggedIn);

// Add sorting, currently sorts by date
postsRouter.get('/', async (req: Request, res: Response) => {
  const posts = new PostsModel();
  const userId = req.session.user?.userId;

  // Handle QueryString.ParsedQs ts warning
  const cursor = parseInt((req.query as any).cursor) || null;

  const result = await posts.list(cursor, PAGE_SIZE, userId);
  res.json({ posts: result });
});

postsRouter.get('/:postId', async (req: Request, res: Response) => {
  const posts = new PostsModel();
  const postId = req.params.postId;
  const userId = req.session.user?.userId;

  // NOTE: comment_count is returned as a string instead of a number
  // https://github.com/brianc/node-postgres/pull/353
  const result = await posts.get(postId, userId).then((record) => {
    if (!record) throw new NotFoundError(`Post with id ${postId} not found`);
    return record;
  });

  res.send(result);
});

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
        const object_key = await redisClient.getAsync(
          `upload_intents:${req.sessionID}`
        );

        // user could modify the location not much we can do, unless we're
        // getting a callback lambda directly when the image uploads
        if (object_key === key && location.split('/').pop() === key) {
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

      res.send({ post_id, votes: result[0], user_vote: vote });
    });
  }
);

export { postsRouter };
