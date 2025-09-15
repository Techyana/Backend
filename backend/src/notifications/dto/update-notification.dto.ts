// src/notifications/dto/update-notification.dto.ts

import {
  IsOptional,
  IsBoolean,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { NotificationType } from '../notification-type.enum'

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Mark notification as read or unread',
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean

  @ApiPropertyOptional({
    type: String,
    maxLength: 255,
    description: 'Updated notification message',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Updated notification type',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType

  @ApiPropertyOptional({
    type: Object,
    description: 'Additional metadata for notification',
  })
  @IsOptional()
  metadata?: Record<string, any>
}
