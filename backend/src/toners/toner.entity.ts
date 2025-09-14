import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { TonerColor } from './toner-color.enum'

@Entity({ name: 'toners' })
export class Toner {
  @ApiProperty({ example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'IMC3000' })
  @Column({ length: 100 })
  model: string

  @ApiProperty({ example: '12345678' })
  @Column({ length: 100 })
  edpCode: string

  @ApiProperty({ enum: TonerColor, example: TonerColor.BLACK })
  @Column({ type: 'enum', enum: TonerColor })
  color: TonerColor

  @ApiProperty({ example: 15000 })
  @Column({ type: 'int', nullable: true })
  yield: number

  @ApiProperty({ example: 10 })
  @Column({ type: 'int', default: 0 })
  stock: number

  @ApiProperty({ example: ['IMC3000', 'MP3055'], type: [String] })
  @Column('text', { array: true, name: 'for_device_models', default: () => 'ARRAY[]::text[]' })
  forDeviceModels: string[]

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @CreateDateColumn({ name: 'created_at_timestamp', type: 'timestamptz' })
  createdAtTimestamp: Date

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at_timestamp', type: 'timestamptz' })
  updatedAtTimestamp: Date
}
