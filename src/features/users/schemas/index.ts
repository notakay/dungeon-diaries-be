import Joi from 'joi';

export const profileUpdateSchema = {
  body: Joi.object({
    bio: Joi.string().required().max(1000)
  })
};

export const getUserProfileSchema = {
  params: Joi.object({
    userId: Joi.number().required()
  })
};

export const profileImageUpdateSchema = {
  body: Joi.object({
    location: Joi.string().required(),
    key: Joi.string().required()
  })
};
