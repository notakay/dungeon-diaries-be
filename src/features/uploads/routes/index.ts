import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import knex from '../../../../knex/knex';
import { s3, getPresignedParams } from '../../../lib/s3';
import { BadRequestError } from '../../../utils/errors';
import { Celebrate } from '../../../lib/celebrate';
import { isLoggedIn } from '../../../middleware/auth';
import redisClient from '../../../utils/redis/client';

import { imageUploadSchema } from '../schemas';

const uploadsRouter: Router = Router();
uploadsRouter.use(isLoggedIn);

uploadsRouter.post(
  '/upload_intent',
  Celebrate(imageUploadSchema),
  async (req: Request, res: Response, _next: NextFunction) => {
    // TODO: Restrict content type
    const object_key = uuidv4() + `.${req.body.content_type}`;
    console.log(req.session);
    const session_id = req.sessionID;

    const params = getPresignedParams(object_key);
    s3.createPresignedPost(params, async (err, data) => {
      if (err) throw new BadRequestError('Error uploading image');
      await redisClient.setAsync(
        `upload_intents:${session_id}`,
        object_key,
        'EX',
        90
      );
      res.send(data);
    });
  }
);

export { uploadsRouter };
