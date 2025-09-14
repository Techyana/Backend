import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../users/user.entity'

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'SET NULL' })
  user: User

  @ApiProperty({ example: 'CLAIM_PART' })
  @Column({ length: 100 })
  action: string

  @ApiProperty({ example: 'User claimed part D009-1234', required: false })
  @Column({ type: 'text', nullable: true })
  details?: string

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date
}
