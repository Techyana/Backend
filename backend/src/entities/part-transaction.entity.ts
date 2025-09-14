import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Part } from './part.entity'
import { User } from '../users/user.entity'
import { TransactionType } from './enums/transaction-type.enum'

@Entity({ name: 'part_transactions' })
export class PartTransaction {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ type: () => Part })
  @ManyToOne(() => Part, (part) => part.transactions, { onDelete: 'CASCADE' })
  part: Part

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.partTransactions, { onDelete: 'SET NULL' })
  user: User

  @ApiProperty({ enum: TransactionType, example: TransactionType.CLAIM })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType

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
