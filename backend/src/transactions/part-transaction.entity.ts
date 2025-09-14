import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Part } from '../entities/part.entity';
import { User } from '../entities/user.entity';
import { PartTransactionType } from './transaction-type.enum';

@Entity('part_transactions')
export class PartTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Part, { nullable: false })
  part: Part;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'enum', enum: PartTransactionType })
  type: PartTransactionType;

  @Column({ type: 'int', default: 0 })
  quantityDelta: number;

  @CreateDateColumn()
  createdAt: Date;
}
