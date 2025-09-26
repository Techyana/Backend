import { TonerTransaction } from '../transactions/toner-transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('toners')
export class Toner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'edpCode' })
  edpCode: string;

  @Column()
  color: string;

  @Column({ name: 'model' })
  model: string;

  @Column({ name: 'yield', nullable: true })
  yield?: number;

  @Column({ name: 'stock' })
  stock: number;

  @Column({ name: 'for_device_models', type: 'simple-array' })
  forDeviceModels: string[];

  @Column({ name: 'from' })
  from: string;

  @Column({ name: 'claimedBy', nullable: true })
  claimedBy?: string;

  @Column({ name: 'claimedAt', type: 'timestamp', nullable: true })
  claimedAt?: Date;

  @Column({ name: 'clientName', nullable: true })
  clientName?: string;

  @Column({ name: 'serialNumber', nullable: true })
  serialNumber?: string;

  @Column({ name: 'collectedBy', nullable: true })
  collectedBy?: string;

  @Column({ name: 'collectedAt', type: 'timestamp', nullable: true })
  collectedAt?: Date;

  @CreateDateColumn({ name: 'created_at_timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at_timestamp' })
  updatedAt: Date;

  @OneToMany(() => TonerTransaction, (tx) => tx.toner)
  transactions: TonerTransaction[];
}
