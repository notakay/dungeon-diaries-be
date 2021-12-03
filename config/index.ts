import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  environment: process.env.NODE_ENV,
  port: parseInt(process.env.PORT!, 10) ?? 3000,
  databasePassword: process.env.POSTGRES_PASSWORD ?? 'postgres'
};
