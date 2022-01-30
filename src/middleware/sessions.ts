import session from 'express-session';
import { env } from '../config';
import redisClient from '../utils/redis/client';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const redisStore = require('connect-redis')(session);
const store = new redisStore({ client: redisClient });
const secret = env.sessionSecret;
const hundredDays = 100 * 24 * 60 * 60 * 1000;

export default session({
  proxy: true,
  secret,
  resave: false,
  cookie: {
    maxAge: hundredDays,
    httpOnly: true,
    secure: env.environment !== 'development',
    domain: env.domain
  },
  store
});
