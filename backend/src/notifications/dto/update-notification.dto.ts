import { IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification-type.enum';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ type: 'string', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({ type: 'object', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
