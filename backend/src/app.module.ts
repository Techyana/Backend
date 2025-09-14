// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { MailModule } from './mail/mail.module';
import { PartsModule } from './parts/parts.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres' as const,
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get<string>('DB_USERNAME', 'postgres'),
        password: cfg.get<string>('DB_PASSWORD', ''),
        database: cfg.get<string>('DB_NAME', 'postgres'),

        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations/*.{ts,js}')],

        synchronize: false,
        migrationsRun: true,
        autoLoadEntities: true,
        logging: cfg.get<boolean>('DB_LOGGING', false) ? ['error','warn','query'] : ['error'],
      }),
    }),

    UsersModule,
    AuthModule,
    MailModule,
    PartsModule,    // ← register module here
  ],
})
export class AppModule {}
