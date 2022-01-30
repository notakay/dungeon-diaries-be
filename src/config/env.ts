import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../.env' });

const ENV_VARS = {
  environment: 'NODE_ENV',
  port: 'PORT',
  domain: 'DOMAIN',
  frontendUrl: 'FRONTEND_URL',
  sessionSecret: 'SESSION_SECRET',
  region: 'AWS_REGION',
  bucket: 'AWS_BUCKET',
  dbName: 'DATABASE_NAME',
  dbUser: 'POSTGRES_USER',
  dbHost: 'POSTGRES_HOST',
  dbPassword: 'POSTGRES_PASSWORD',
  redisHost: 'REDIS_HOST',
  redisPassword: 'REDIS_PASSWORD'
};

const env: { [key: string]: any } = {};

for (let [key, value] of Object.entries(ENV_VARS)) {
  if (!process.env[value]) console.log(`${value} has not been set.`);
  env[key] = process.env[value] ?? '';
}

export default env;
