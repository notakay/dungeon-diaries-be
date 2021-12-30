import session from 'express-session';
import config from '../../config';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client = redis.createClient({
  host: config.redisHost,
  password: config.redisPassword,
  port: 6379
});
const store = new redisStore({ client });

const secret = config.sessionSecret;

const hundredDays = 100 * 24 * 60 * 60 * 1000;

export default session({
  proxy: true,
  secret,
  resave: false,
  cookie: {
    maxAge: hundredDays,
    httpOnly: true,
    secure: config.environment === 'docker',
    domain: 'dungeon-diaries.xyz'
  },
  store
});
