import 'reflect-metadata';
import { join } from 'path';
import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from './users/user.entity';
import { Part } from './entities/part.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSourceOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ User, Part],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: ['error', 'query'],
};

const AppDataSource = new DataSource(dataSourceOptions)

AppDataSource.initialize()
  .then(() => {
    console.log(
      'Connected to database:',
      dataSourceOptions.type,
      dataSourceOptions.host,
      dataSourceOptions.port,
      dataSourceOptions.database,
    );
  })
  .catch((err) => {
    console.error('DataSource init error', err);
  });

export default AppDataSource;
