import { Knex } from 'knex';
import config from './config';

const development: Knex.Config = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: config['databasePassword'],
    database: 'dungeon_diaries',
    charset: 'utf8'
  },
  migrations: {
    directory: __dirname + '/knex/migrations'
  }
};

export default { development };
