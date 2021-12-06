import Joi from 'joi';

export const getCommentsSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  })
};

export const createCommentSchema = {
  params: Joi.object({
    postId: Joi.number().required()
  }),
  body: Joi.object({
    content: Joi.string().required(),
    parentCommentId: Joi.number().allow(null)
  })
};

export const deleteCommentSchema = {
  params: Joi.object({
    commentId: Joi.number().required()
  })
};
