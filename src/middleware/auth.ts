import { Request, Response } from 'express';

export const isLoggedIn = (req: Request, res: Response, next: () => void) => {
  if (!req.session.user?.isLoggedIn || !req.session.user?.userId)
    throw Error('Not logged in');
  next();
};
