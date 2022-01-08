import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

export default {
  environment: process.env.NODE_ENV,
  port: parseInt(process.env.PORT! ?? 3000, 10),
  sessionSecret: process.env.SESSION_SECRET ?? '',
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET,
  dbHost: process.env.POSTGRES_HOST ?? '127.0.0.1',
  dbPassword: process.env.POSTGRES_PASSWORD,
  redisHost: process.env.REDIS_HOST ?? '127.0.0.1',
  redisPassword: process.env.REDIS_PASSWORD,
  frontendUrls:
    process.env.NODE_ENV === 'docker'
      ? [
          'https://www.dungeon-diaries.xyz',
          'https://dungeon-diaries-fe.vercel.app'
        ]
      : ['http://localhost:3000']
};
