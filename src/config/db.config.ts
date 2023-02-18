import { registerAs } from '@nestjs/config';

export interface TypeormConfiguration {
  type: 'postgres';
  logging: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadEntities: boolean;
  migrationsRun: boolean;
  entities: string[];
  migrations: string[];
  cli: {
    migrationsDir: string;
  };
}

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
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default registerAs('database', () => dataSourceOptions);
