import session from 'express-session';
import KnexSessionStore from 'connect-session-knex';
import config from '../../config';

import knex from '../../knex/knex';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const knexSessionStore = KnexSessionStore(session);
const store = new knexSessionStore({ knex });

const secret = config.sessionSecret;

const hundredDays = 100 * 24 * 60 * 60 * 1000;

export default session({
  secret,
  resave: false,
  cookie: {
    maxAge: hundredDays,
    httpOnly: true
  },
  store
});
