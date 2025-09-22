import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Notification } from '../notification.entity'
import { NotificationType } from '../notification-type.enum'

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification UUID', format: 'uuid' })
  id: string

  @ApiProperty({ description: 'UUID of the user receiving this notification', format: 'uuid' })
  userId: string

  @ApiProperty({ description: 'Notification message text' })
  message: string

  @ApiProperty({ description: 'Category of notification', enum: NotificationType, example: NotificationType.PART_AVAILABLE })
  type: NotificationType

  @ApiProperty({ description: 'Read status', default: false })
  isRead: boolean

  @ApiPropertyOptional({
    description: 'Arbitrary metadata payload',
    type: 'object',
    additionalProperties: true,
  })
  metadata?: Record<string, any>

  @ApiProperty({ description: 'When this notification was created', format: 'date-time' })
  timestamp: Date

  constructor(entity: Notification) {
    this.id = entity.id
    this.userId = entity.user.id
    this.message = entity.message
    this.type = entity.type
    this.isRead = entity.isRead
    this.metadata = entity.metadata
    this.timestamp = entity.timestamp
  }
}
