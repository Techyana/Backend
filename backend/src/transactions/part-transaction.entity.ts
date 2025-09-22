// src/transactions/part-transaction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm'
import { Part } from '../parts/part.entity'
import { User } from '../users/user.entity'
import { PartTransactionType } from './transaction-type.enum'

@Entity({ name: 'part_transactions' })
export class PartTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'enum', enum: PartTransactionType, enumName: 'part_transactions_type_enum' })
  type: PartTransactionType

  // Positive for stock increases, negative for decreases
  @Column('integer')
  quantityDelta: number

  @Column('text', { nullable: true })
  details?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @ManyToOne(() => Part, (part) => part.transactions, {
    onDelete: 'CASCADE',
    eager: false,
  })
  part: Part

  @ManyToOne(() => User, { eager: true })
  user: User
}
