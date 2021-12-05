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

const oneHour = 60 * 60 * 1000;

export default session({
  secret,
  resave: false,
  cookie: {
    maxAge: oneHour,
    httpOnly: true
  },
  store
});
