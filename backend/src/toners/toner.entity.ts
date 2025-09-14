import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TonerColor } from './toner-color.enum';

@Entity('toners')
export class Toner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 50 })
  edpCode: string;

  @Column({ type: 'enum', enum: TonerColor })
  color: TonerColor;

  @Column({ type: 'int' })
  yield: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'simple-array' })
  forDeviceModels: string[];
}
