import session from 'express-session';
import KnexSessionStore from 'connect-session-knex';

import knex from '../../knex/knex';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const knexSessionStore = KnexSessionStore(session);
const store = new knexSessionStore({ knex });

// TODO: dotenv or config
const secret = 'dungeon_secret';

export default session({
  secret,
  resave: false,
  cookie: {
    maxAge: 60000 // ten seconds, for testing
  },
  store
});
