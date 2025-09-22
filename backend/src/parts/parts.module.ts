// src/parts/parts.module.ts

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PartsController } from './parts.controller'
import { PartsService } from './parts.service'
import { Part } from './part.entity'
import { PartTransaction } from '../transactions/part-transaction.entity'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Part, PartTransaction]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}
