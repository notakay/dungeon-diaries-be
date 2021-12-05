import { Request, Response, NextFunction } from 'express';

import { UnauthorizedError } from '../utils/errors';

export const isLoggedIn = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.session.user?.isLoggedIn || !req.session.user?.userId)
    throw new UnauthorizedError('User not logged in');
  next();
};
