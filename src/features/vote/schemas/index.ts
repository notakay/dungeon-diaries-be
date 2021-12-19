import Joi from 'joi';

export const postVoteSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  }),
  body: Joi.object({
    vote: Joi.number().required()
  })
};
