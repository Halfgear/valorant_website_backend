import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';

export const typeORMConfig: TypeOrmModuleOptions = databaseConfig;
