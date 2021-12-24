import { Knex } from 'knex';
import config from './config';

const generateConfig = (env: string): Knex.Config => ({
  client: 'pg',
  connection: {
    host: env === 'docker' ? 'postgres' : '127.0.0.1',
    user: 'postgres',
    password: config['databasePassword'],
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
