import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';
import { Celebrate } from '../../../lib/celebrate';
import { postVoteSchema } from '../schemas';

const voteRouter: Router = Router();
voteRouter.use(isLoggedIn);

voteRouter.post(
  '/:postId',
  Celebrate(postVoteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.session.user?.userId;
    const post_id = req.params.postId;

    // enforce limits
    let vote = req.body.vote ?? 0;
    if (vote < 0) vote = -1;
    else if (vote > 0) vote = 1;

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
      await trx('posts').where({ id: post_id }).increment('votes', diff);

      res.send(`Voted on ${post_id}`);
    });
  }
);

export { voteRouter };
