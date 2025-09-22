// src/parts/part.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { PartTransaction } from '../transactions/part-transaction.entity'
import { PartStatus } from './part-status.enum'
import { User } from '../users/user.entity'

@Entity({ name: 'parts' })
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ name: 'part_number', length: 50 })
  partNumber: string

  // Store model names as text[]
  @Column('text', {
    name: 'for_device_models',
    array: true,
    default: () => `ARRAY[]::text[]`,
  })
  forDeviceModels: string[]

  // Total on-hand stock used to show "Available" badge when > 0
  @Column('integer', { default: 0 })
  quantity: number

  @Column({
    type: 'enum',
    enum: PartStatus,
    enumName: 'parts_status_enum',
    default: PartStatus.AVAILABLE,
  })
  status: PartStatus

  // Claim fields for engineer "My Claims" and admin Collections view
  @Column('uuid', { name: 'claimed_by_id', nullable: true })
  claimedById?: string | null

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'claimed_by_id' })
  claimedBy?: User | null

  @Column({ type: 'timestamptz', nullable: true, name: 'claimed_at' })
  claimedAt?: Date | null

  @Column({ type: 'boolean', default: false })
  collected: boolean

  @Column({ type: 'timestamptz', nullable: true, name: 'collected_at' })
  collectedAt?: Date | null

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

  @OneToMany(() => PartTransaction, (tx) => tx.part)
  transactions: PartTransaction[]
}
