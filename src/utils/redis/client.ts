import { env } from '../../config';

const redis = require('redis');
const { promisifyAll } = require('bluebird');

promisifyAll(redis);

export default redis.createClient({
  host: env.redisHost,
  password: env.redisPassword,
  port: 6379
});
