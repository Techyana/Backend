import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Device } from './device.entity'
import { Part } from './part.entity'

@Entity({ name: 'stripped_parts' })
export class StrippedPart {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ type: () => Device })
  @ManyToOne(() => Device, (device) => device.strippedParts, { onDelete: 'CASCADE' })
  device: Device

  @ApiProperty({ type: () => Part })
  @ManyToOne(() => Part, { onDelete: 'CASCADE' })
  part: Part

  @ApiProperty({ example: 'Fuser Unit' })
  @Column({ length: 150 })
  partName: string

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'stripped_at', type: 'timestamptz' })
  strippedAt: Date
}
