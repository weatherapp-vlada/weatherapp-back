import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { registerAs } from '@nestjs/config';

export const mikroOrmOptions: MikroOrmModuleOptions = {
  // entities: ['dist/**/*.entity.js'],
  // entitiesTs: ['src/**/*.entity.ts'],
  debug: false,
  dbName: process.env.DB_NAME,
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  forceUtcTimezone: true,
  migrations: {
    pathTs: process.cwd() + '/migrations',
    path: process.cwd() + '/dist/src/migrations',
  },
};

export default registerAs('database', () => mikroOrmOptions);
