import Joi from 'joi';

export const getPostByIdSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  })
};

export const createPostSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    location: Joi.string().optional(),
    key: Joi.string().optional()
  })
};

export const votePostSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  }),
  body: Joi.object({
    vote: Joi.number().integer().min(-1).max(1).required()
  })
};
