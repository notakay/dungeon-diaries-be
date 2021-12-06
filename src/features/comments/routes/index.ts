import { Router, Request, Response, NextFunction } from 'express';

import knex from '../../../../knex/knex';
import { isLoggedIn } from '../../../middleware/auth';

const commentsRouter: Router = Router();

commentsRouter.use(isLoggedIn);

// TODO: Fix ts-ignores and
// TODO: improve comments GET for more functionality

commentsRouter.get(
  '/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { commentId = null, depth = 1 } = req.body;

    const records = await knex('comments')
      .join('users', 'users.id', 'comments.user_id')
      .select('comments.*', 'users.username')
      .where('comments.post_id', postId)
      .orderBy('comments.depth', 'asc');

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

export { commentsRouter };
