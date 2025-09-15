import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string

  @ApiProperty({ enum: NotificationType, example: NotificationType.PART_ARRIVAL, })
  type: NotificationType

  @ApiProperty()
  message: string

  @ApiPropertyOptional({ type: Boolean })
  isRead: boolean

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  userId?: string

  @ApiPropertyOptional({ type: Object, description: 'Any extra metadata' })
  metadata?: Record<string, any>


  @ApiProperty({ type: String, format: 'date-time' })
  timestamp: string
}
