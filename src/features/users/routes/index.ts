import { Router, Request, Response, NextFunction } from 'express';

import { knex } from '../../../config';
import { Celebrate } from '../../../lib/celebrate';
import {
  profileUpdateSchema,
  getUserProfileSchema,
  profileImageUpdateSchema
} from '../schemas';
import { isLoggedIn } from '../../../middleware/auth';
import { sanitizeUser } from '../transforms';
import { NotFoundError, BadRequestError } from '../../../utils/errors';
import redisClient from '../../../utils/redis/client';

const usersRouter: Router = Router();

usersRouter.use(isLoggedIn);

usersRouter.get(
  '/me',
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId: number = req.session.user?.userId;

    const user = await knex('users').select('*').where('id', userId).first();

    res.json(sanitizeUser(user));
  }
);

usersRouter.put(
  '/me',
  Celebrate(profileUpdateSchema),
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId: number = req.session.user?.userId;
    const { bio } = req.body;

    const [user] = await knex('users')
      .update({
        bio,
        updated_at: knex.fn.now()
      })
      .where('id', userId)
      .returning('*');

    res.json(sanitizeUser(user));
  }
);

usersRouter.put(
  '/my-profile-image',
  Celebrate(profileImageUpdateSchema),
  async (req: Request, res: Response, _next: NextFunction) => {
    const user_id: number | undefined = req.session.user?.userId;
    const { location, key } = req.body;
    let image = '';

    // TODO refactor copypasta
    if (key) {
      const object_key = await redisClient.getAsync(
        `upload_intents:${req.sessionID}`
      );

      if (object_key === key && location.split('/').pop() === key) {
        image = location;
      } else {
        throw new BadRequestError('Error uploading image');
      }
    }

    const [user] = await knex('users')
      .update({ profile_image: image, updated_at: knex.fn.now() })
      .where({ id: user_id })
      .returning('*');

    res.json(sanitizeUser(user));
  }
);

usersRouter.get(
  '/profile/:userId',
  Celebrate(getUserProfileSchema),
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;

    const user = await knex('users').select('*').where('id', userId).first();

    if (!user) {
      throw new NotFoundError(`User does not exist`);
    }

    res.json(sanitizeUser(user));
  }
);

export { usersRouter };
