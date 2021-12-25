import { Knex } from 'knex';
import config from './config';

const generateConfig = (env: string): Knex.Config => ({
  client: 'pg',
  connection: {
    host: config.dbHost,
    user: 'postgres',
    password: config.dbPassword,
    database: 'dungeon_diaries',
    charset: 'utf8'
  },
  migrations: {
    directory: __dirname + '/knex/migrations'
  }
});

export default {
  development: generateConfig('development'),
  docker: generateConfig('docker')
};
