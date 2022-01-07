import config from '../../../config';

const redis = require('redis');
const { promisifyAll } = require('bluebird');

promisifyAll(redis);

export default redis.createClient({
  host: config.redisHost,
  password: config.redisPassword,
  port: 6379
});
