import Joi from 'joi';

export const postVoteSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  }),
  body: Joi.object({
    vote: Joi.number().integer().min(-1).max(1).required()
  })
};
