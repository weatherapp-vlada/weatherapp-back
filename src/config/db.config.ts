import { registerAs } from '@nestjs/config';

export const dataSourceOptions = {
  type: 'postgres',
  logging: true,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  migrationsRun: true,
  // synchronize: process.env.MODE === "dev",
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default registerAs('database', () => dataSourceOptions);
