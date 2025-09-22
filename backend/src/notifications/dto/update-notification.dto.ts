// src/notifications/dto/update-notification.dto.ts

import { IsOptional, IsBoolean, IsString, MaxLength, IsEnum, IsObject } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { NotificationType } from '../notification-type.enum'

export class UpdateNotificationDto {
  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean

  @ApiPropertyOptional({ type: 'string', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType

  // Describe Record<string, any> to Swagger
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Arbitrary metadata payload',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
