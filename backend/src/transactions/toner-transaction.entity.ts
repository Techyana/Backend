// src/transactions/toner-transaction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm'
import { Toner } from '../toners/toner.entity'
import { User } from '../users/user.entity'
import { TransactionType } from './transaction-type.enum'

@Entity({ name: 'toner_transactions' })
export class TonerTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'enum', enum: TransactionType, enumName: 'toner_transactions_type_enum' })
  type: TransactionType

  // Positive for stock increases, negative for decreases
  @Column('integer')
  quantityDelta: number

  @Column('text', { nullable: true })
  details?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @ManyToOne(() => Toner, (toner) => toner.transactions, {
    onDelete: 'CASCADE',
    eager: false,
  })
  toner: Toner

  @ManyToOne(() => User, { eager: true })
  user: User
}
