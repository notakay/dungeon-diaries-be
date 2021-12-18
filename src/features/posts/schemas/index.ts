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
    cache_key: Joi.string()
  })
};
