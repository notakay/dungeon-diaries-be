import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

const defaultOptions = {
  abortEarly: true,
  allowUnknow: true,
  stripUnknown: true
};

// @ts-ignore
export const validate = (schema, options = defaultOptions) => {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const { value, error } = schema.validate(req.body, options);
      if (error) {
        throw new BadRequestError(error);
      }

      // replaces request body with unnecessary values stripped
      req.body = value;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};
