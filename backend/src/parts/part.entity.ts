// src/parts/part.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { PartStatus } from './part-status.enum'
import { PartTransaction } from '../transactions/part-transaction.entity'

@Entity({ name: 'parts' })
export class Part {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'Fuser Unit' })
  @Column({ length: 100 })
  name: string

  @ApiProperty({ example: 'D009-1234' })
  @Column({ length: 50, name: 'part_number' })
  partNumber: string

  @ApiProperty({ example: ['IMC3000', 'MP3055'], type: [String] })
  @Column('text', {
    array: true,
    name: 'for_device_models',
    default: () => 'ARRAY[]::text[]',
  })
  forDeviceModels: string[]

  @ApiProperty({ example: 5 })
  @Column({ type: 'int', default: 1 })
  quantity: number

  @ApiProperty({ example: 3 })
  @Column({ type: 'int', default: 1, name: 'available_quantity' })
  availableQuantity: number

  @ApiProperty({ enum: PartStatus, example: PartStatus.AVAILABLE })
  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.AVAILABLE,
    name: 'status',
  })
  status: PartStatus

  @ApiProperty({ example: 'Acme Corp', required: false })
  @Column({ nullable: true })
  client?: string

  @ApiProperty({ example: 'RZ123456', required: false })
  @Column({ nullable: true })
  deviceSerial?: string

  @ApiProperty({ example: false })
  @Column({ default: false })
  collected: boolean

  @ApiProperty({ type: () => [PartTransaction], required: false })
  @OneToMany(() => PartTransaction, (tx) => tx.part)
  transactions: PartTransaction[]

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({
    name: 'created_at_timestamp',
    type: 'timestamptz',
  })
  createdAtTimestamp: Date

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @UpdateDateColumn({
    name: 'updated_at_timestamp',
    type: 'timestamptz',
  })
  updatedAtTimestamp: Date
}
