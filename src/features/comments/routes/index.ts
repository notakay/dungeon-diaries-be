import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';
import { Celebrate } from '../../../lib/celebrate';
import {
  getCommentsSchema,
  createCommentSchema,
  deleteCommentSchema
} from '../schemas';
import { sanitizeDeletedComment } from '../transforms';
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
      .select('comments.*', 'users.username')
      .where('comments.post_id', postId)
      .orderBy('comments.depth', 'asc');

    const records = rawRecords.map(sanitizeDeletedComment);

    const comments = {};

    records.forEach((record) => {
      if (record.lineage === '/') {
        //@ts-ignore
        comments[record.id] = { ...record, children: {} };
      } else {
        const ancestors = record.lineage.split('/');
        ancestors.shift();
        ancestors.pop();

        const parent = ancestors.reduce(
          //@ts-ignore
          (prev, key) => prev[key].children,
          comments
        );
        parent[record.id] = { ...record, children: {} };
      }
    });

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
