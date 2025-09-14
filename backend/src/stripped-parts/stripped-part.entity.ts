import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Part } from '../entities/part.entity';
import { Device } from '../entities/device.entity';

@Entity('stripped_parts')
export class StrippedPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Part, { nullable: false })
  part: Part;

  @ManyToOne(() => Device, { nullable: false })
  device: Device;

  @Column({ type: 'varchar', length: 255 })
  partName: string;

  @CreateDateColumn()
  strippedAt: Date;
}
