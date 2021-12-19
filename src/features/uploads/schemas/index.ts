import Joi from 'joi';

export const imageUploadSchema = {
  body: Joi.object({
    content_type: Joi.string().required()
  })
};
