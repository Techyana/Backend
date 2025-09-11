// src/entities/part.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../users/user.entity'
import { PartStatus } from './part-status.enum'

@Entity({ name: 'parts' })
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 50, name: 'part_number' })
  partNumber: string

  @Column('text', {
    array: true,
    name: 'for_device_models',
    default: () => 'ARRAY[]::text[]',
  })
  forDeviceModels: string[]

  @Column({ type: 'int', default: 1 })
  quantity: number

  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.AVAILABLE,
    name: 'status',
  })
  status: PartStatus

  // FK column for the claimer
  @Column('uuid', { name: 'claimed_by_user_id', nullable: true })
  claimedById?: string

  // Who reserved/claimed it for pickup
  @ManyToOne(() => User, (user) => user.claimedParts, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'claimed_by_user_id' })
  claimedBy?: User

  @Column({ name: 'claimed_at', type: 'timestamptz', nullable: true })
  claimedAt?: Date

  // Who requested an out-of-stock order
  @Column('uuid', { name: 'requested_by_user_id', nullable: true })
  requestedByUserId?: string

  @Column({ name: 'requested_by_user_email', nullable: true })
  requestedByUserEmail?: string

  @Column({
    name: 'requested_at_timestamp',
    type: 'timestamptz',
    nullable: true,
  })
  requestedAtTimestamp?: Date

  // Timestamps
  @CreateDateColumn({
    name: 'created_at_timestamp',
    type: 'timestamptz',
  })
  createdAtTimestamp: Date

  @UpdateDateColumn({
    name: 'updated_at_timestamp',
    type: 'timestamptz',
  })
  updatedAtTimestamp: Date
}
