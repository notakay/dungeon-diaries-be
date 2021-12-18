import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import S3 from 'aws-sdk/clients/s3';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

import { getPostByIdSchema, createPostSchema } from '../schemas';
import { Celebrate } from '../../../lib/celebrate';
import { BadRequestError, NotFoundError } from '../../../utils/errors';

const { region, bucket } = process.env;
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
  '/presigned',
  async (req: Request, res: Response, _next: NextFunction) => {
    const s3 = new S3({ region });

    // TODO: Go over this
    const object_key = crypto
      .createHash('md5')
      .update(
        // @ts-ignore
        req.session.user.userId +
          Math.floor(Date.now() / 1000).toString() +
          process.env.salt
      )
      .digest('hex');
    const cache_key = crypto
      .createHash('md5')
      .update(object_key + process.env.salt)
      .digest('hex');

    var params = {
      Bucket: bucket,
      Fields: {
        key: object_key
      }
    };
    s3.createPresignedPost(params, async function (err, data) {
      if (err) throw err;
      else {
        await knex('upload_intents')
          .insert({ object_key, cache_key })
          .then(() => res.send(data));
      }
    });
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
      // isLoggedIn middleware should ensure that userId is not undefined
      const userId: number | undefined = req.session.user?.userId;
      if (!userId)
        throw new BadRequestError('An error as occured, userId is undefined');

      const { title = '', content = '', cache_key } = req.body;
      if (!title) throw new BadRequestError('Title cannot be null');

      let object_key = '';
      if (cache_key) {
        // @ts-ignore
        object_key = await knex('upload_intents')
          .select('object_key')
          .where('object_key', cache_key);
      }

      // NOTE: relies on us using aws s3 as image upload provider
      let image = object_key
        ? `https://${region}.s3.${region}.amazonaws.com/${object_key} `
        : '';

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
