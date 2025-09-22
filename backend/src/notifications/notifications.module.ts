// src/notifications/notifications.module.ts

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from './notification.entity'
import { NotificationsController } from './notifications.controller'
import { NotificationService } from './notifications.service'
import { NotificationsGateway } from './notifications.gateway'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService],
})
export class NotificationsModule {}
