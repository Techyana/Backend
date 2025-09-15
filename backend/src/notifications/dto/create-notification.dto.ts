import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator'
import { NotificationType } from '../notification-type.enum'

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, default: NotificationType.GENERAL })
  @IsEnum(NotificationType)
  type: NotificationType

  @ApiProperty({ type: String, maxLength: 255 })
  @IsString()
  message: string

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean

  @ApiPropertyOptional({
  type: Object,
  description: 'Optional JSON metadata',
  })
  metadata?: Record<string, any>

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string
}
