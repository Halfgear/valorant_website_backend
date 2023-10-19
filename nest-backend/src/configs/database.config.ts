import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import dotenvConfigObject from '../utils/dotenvConfigObject';
import * as path from 'path';

dotenv.config(dotenvConfigObject);

export const databaseConfig: DataSourceOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: process.env.DB_SYNC == 'true',
  logging: process.env.DB_LOGGING == 'true',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations', // migration 내용이 기록될 테이블명(default = migration)
  migrationsRun: false,
};