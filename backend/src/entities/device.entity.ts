import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { DeviceStatus } from './enums/device-status.enum'
import { StrippedPart } from './stripped-part.entity'

@Entity({ name: 'devices' })
export class Device {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'IMC3000' })
  @Column({ length: 100 })
  model: string

  @ApiProperty({ example: 'RZ123456' })
  @Column({ length: 100, unique: true })
  serialNumber: string

  @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.APPROVED_FOR_DISPOSAL })
  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.APPROVED_FOR_DISPOSAL })
  status: DeviceStatus

  @ApiProperty({ example: 'Acme Corp', required: false })
  @Column({ nullable: true })
  customerName?: string

  @ApiProperty({ example: 'Good', required: false })
  @Column({ nullable: true })
  condition?: string

  @ApiProperty({ example: 'Device ready for disposal', required: false })
  @Column({ nullable: true })
  comments?: string

  @ApiProperty({ example: 'End of contract', required: false })
  @Column({ nullable: true })
  removalReason?: string

  @ApiProperty({ type: () => [StrippedPart], required: false })
  @OneToMany(() => StrippedPart, (sp) => sp.device)
  strippedParts: StrippedPart[]

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'created_at_timestamp', type: 'timestamptz' })
  createdAtTimestamp: Date

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at_timestamp', type: 'timestamptz' })
  updatedAtTimestamp: Date
}
