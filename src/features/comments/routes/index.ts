import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';
import { Celebrate } from '../../../lib/celebrate';
import {
  getCommentsSchema,
  createCommentSchema,
  deleteCommentSchema
} from '../schemas';
import { sanitizeDeletedComment, nestComments } from '../transforms';
import { BadRequestError } from '../../../utils/errors';

const commentsRouter: Router = Router();

commentsRouter.use(isLoggedIn);

// TODO: Fix ts-ignores and
// TODO: improve comments GET for more functionality

commentsRouter.get(
  '/:postId',
  Celebrate(getCommentsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { commentId = null, depth = 1 } = req.body;

    const rawRecords = await knex('comments')
      .join('users', 'users.id', 'comments.user_id')
      .select(
        'comments.*',
        'comments.user_id as author_id',
        'users.username as author'
      )
      .where('comments.post_id', postId)
      .orderBy('comments.created_at', 'asc');

    const records = rawRecords.map(sanitizeDeletedComment);

    const comments = nestComments(records);

    res.send(comments);
  }
);

commentsRouter.post(
  '/:postId',
  Celebrate(createCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { content, parentCommentId = null } = req.body;

    let lineage = '/';
    let depth = 0;

    if (parentCommentId) {
      const parentComment = await knex('comments')
        .select('depth', 'lineage')
        .where({ id: parentCommentId, post_id: postId })
        .first();
      //@ts-ignore
      depth = parentComment.depth + 1;
      //@ts-ignore
      lineage = parentComment.lineage + `${parentCommentId}/`;
    }

    const id: Array<number> = await knex('comments')
      .insert({
        parent_id: parentCommentId,
        post_id: postId,
        user_id: req.session.user?.userId,
        depth,
        lineage,
        content
      })
      .returning('id');
    res.send(`Successfully created comment with comment id ${id}`);
  }
);

commentsRouter.delete(
  '/:commentId',
  Celebrate(deleteCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const authUserId = req.session.user?.userId;

    const updatedCount = await knex('comments')
      .where({ id: commentId, user_id: authUserId })
      .update({ deleted_at: knex.fn.now() });

    if (!updatedCount) {
      throw new BadRequestError('Could not delete comment');
    }

    res.status(200).send();
  }
);

export { commentsRouter };
