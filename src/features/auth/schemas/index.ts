import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required().messages({
      'string.alphanum':
        'Username should only consist of english alphabets and numbers'
    }),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};
