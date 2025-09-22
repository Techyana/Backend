// src/notifications/dto/create-notification.dto.ts

import { IsUUID, IsString, IsEnum, IsOptional, MaxLength, IsBoolean, IsObject } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { NotificationType } from '../notification-type.enum'

export class CreateNotificationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  message: string

  // Describe Record<string, any> to Swagger
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Arbitrary metadata payload',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ type: 'boolean', default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean
}
