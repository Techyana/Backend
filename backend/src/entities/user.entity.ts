import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { PartTransaction } from './part-transaction.entity'
import { Notification } from './notification.entity'
import { ActivityLog } from './activity-log.entity'

export enum UserRole {
  ADMIN = 'admin',
  ENGINEER = 'engineer',
  SUPERVISOR = 'supervisor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string

  @Column({ length: 100 })
  surname: string

  @Column({ length: 50 })
  rzaNumber: string

  @Column({ length: 150, unique: true })
  email: string

  @Column()
  passwordHash: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  mustChangePassword: boolean

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => PartTransaction, tx => tx.user)
  partTransactions: PartTransaction[]

  @OneToMany(() => Notification, n => n.user)
  notifications: Notification[]

  @OneToMany(() => ActivityLog, log => log.user)
  activityLogs: ActivityLog[]
}
