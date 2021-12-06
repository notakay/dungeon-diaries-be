const { celebrator } = require('celebrate');

export const Celebrate = celebrator({}, { abortEarly: false, convert: true });
