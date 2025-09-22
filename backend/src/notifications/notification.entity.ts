// src/notifications/notification.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { User } from '../users/user.entity'
import { NotificationType } from './notification-type.enum'

@Entity({ name: 'notifications' })
export class Notification {
  @ApiProperty({ description: 'Notification UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ description: 'Recipient user', type: () => User })
  @ManyToOne(() => User, (user) => user.notifications, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User

  @ApiProperty({ description: 'Message body' })
  @Column('text')
  message: string

  @ApiProperty({ description: 'Notification category', enum: NotificationType })
  @Column({ type: 'enum', enum: NotificationType, enumName: 'notifications_type_enum', default: NotificationType.GENERAL })
  type: NotificationType

  @ApiPropertyOptional({ description: 'Arbitrary metadata payload' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @ApiProperty({ description: 'Read status', default: false })
  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean

  @ApiProperty({ description: 'Creation timestamp', format: 'date-time' })
  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date
}
