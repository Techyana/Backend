import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../users/user.entity'
import { NotificationType } from './enums/notification-type.enum'

@Entity({ name: 'notifications' })
export class Notification {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User

  @ApiProperty({ example: 'Part D009-1234 has arrived.' })
  @Column({ type: 'text' })
  message: string

  @ApiProperty({ enum: NotificationType, example: NotificationType.PART_ARRIVAL })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType

  @ApiProperty({ example: false })
  @Column({ default: false })
  isRead: boolean

  @ApiProperty({ example: '{"partId":"uuid-string"}', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date
}
