// src/entities/part-transaction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Part } from '../parts/part.entity'
import { User } from '../users/user.entity'
import { PartTransactionType } from './transaction-type.enum'

@Entity({ name: 'part_transactions' })
export class PartTransaction {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ type: () => Part })
  @ManyToOne(() => Part, (part) => part.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'part_id' })
  part: Part

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.claimedTransactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ApiProperty({ enum: PartTransactionType, example: PartTransactionType.CLAIM })
  @Column({ type: 'enum', enum: PartTransactionType })
  type: PartTransactionType

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', default: 1 })
  quantityDelta: number

  @ApiProperty({ example: 'Claimed for urgent repair', required: false })
  @Column({ type: 'text', nullable: true })
  details?: string

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}
