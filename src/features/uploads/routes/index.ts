import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import config from '../../../../config';
import knex from '../../../../knex/knex';
import { s3, getPresignedParams } from '../../../lib/s3';
import { isLoggedIn } from '../../../middleware/auth';

const uploadsRouter: Router = Router();
uploadsRouter.use(isLoggedIn);

uploadsRouter.get(
  '/presigned',
  async (req: Request, res: Response, _next: NextFunction) => {
    // Generate random object key
    let object_key = crypto
      .createHash('md5')
      .update(
        // @ts-ignore
        req.session.user.userId +
          Math.floor(Date.now() / 1000).toString() +
          config.salt
      )
      .digest('hex');
    object_key += '.jpg';

    // Generate cache_key from objecct key
    const cache_key = crypto
      .createHash('md5')
      .update(object_key + process.env.salt)
      .digest('hex');

    const params = getPresignedParams(object_key);

    s3.createPresignedPost(params, async (err, data) => {
      if (err) throw err;
      await knex('upload_intents')
        .insert({ object_key, cache_key })
        .then(() => res.send({ cache_key, ...data }));
    });
  }
);

export { uploadsRouter };
