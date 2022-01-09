import config from './config';

export default {
  client: 'pg',
  connection: {
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    charset: 'utf8'
  },
  migrations: {
    directory: __dirname + '/knex/migrations'
  }
};
