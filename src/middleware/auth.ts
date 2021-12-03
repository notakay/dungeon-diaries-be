import { Request, Response } from 'express';

import { UnauthorizedError } from '../utils/errors';

export const isLoggedIn = (req: Request, res: Response, next: () => void) => {
  if (!req.session.user?.isLoggedIn || !req.session.user?.userId)
    throw new UnauthorizedError('User not logged in');
  next();
};
