import 'reflect-metadata';
import { join } from 'path';
import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from './users/user.entity';
import { Part } from './parts/part.entity';
import { Device } from './devices/device.entity';
import { Toner } from './toners/toner.entity';
import { PartTransaction } from './transactions/part-transaction.entity';
import { Notification } from './notifications/notification.entity';
import { ActivityLog } from './activity-logs/activity-log.entity';
import { StrippedPart } from './stripped-parts/stripped-part.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSourceOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
  User,
  Part,
  Device,
  Toner,
  PartTransaction,
  Notification,
  ActivityLog,
  StrippedPart,
],
  migrations: [join(__dirname, '/database/migrations', '*{.ts,.js}')],
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
