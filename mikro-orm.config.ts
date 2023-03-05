import { Options } from '@mikro-orm/core';

const config: Options = {
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: process.env.DB_NAME,
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  forceUtcTimezone: true,
  migrations: {
    pathTs: './src/migrations',
    path: './dist/src/migrations',
  },
};

export default config;
