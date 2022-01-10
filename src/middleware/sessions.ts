import session from 'express-session';
import config from '../../config';
import redisClient from '../utils/redis/client';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const redisStore = require('connect-redis')(session);
const store = new redisStore({ client: redisClient });
const secret = config.sessionSecret;
const hundredDays = 100 * 24 * 60 * 60 * 1000;

export default session({
  proxy: true,
  secret,
  resave: false,
  cookie: {
    maxAge: hundredDays,
    httpOnly: true,
    secure: config.environment !== 'development',
    domain: config.domain
  },
  store
});
