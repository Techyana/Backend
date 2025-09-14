import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Role } from './role.enum';
import { PartTransaction } from '../entities/part-transaction.entity'
import { Notification } from '../notifications/notification.entity'
import { ActivityLog } from '../notifications/activity-log.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ name: 'rza_number', type: 'varchar', length: 50 })
  rzaNumber: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.ENGINEER })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'must_change_password', type: 'boolean', default: true })
  mustChangePassword: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PartTransaction, (tx) => tx.user)
  claimedTransactions: PartTransaction[];

  @OneToMany(() => Notification, n => n.user)
  notifications: Notification[]

  @OneToMany(() => ActivityLog, log => log.user)
  activityLogs: ActivityLog[]
}
