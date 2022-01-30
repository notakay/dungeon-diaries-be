import env from './env';

export default {
  client: 'pg',
  connection: {
    host: env.dbHost,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    charset: 'utf8'
  },
  migrations: {
    directory: __dirname + '/../../knex/migrations'
  }
};
