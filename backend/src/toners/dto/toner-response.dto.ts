import { Expose } from 'class-transformer';

export class TonerResponseDto {
  @Expose()
  id: string;

  @Expose()
  edpCode: string;

  @Expose()
  color: string;

  @Expose()
  model: string;

  @Expose()
  stock: number;

  @Expose()
  yield?: number;

  @Expose()
  from: string;

  @Expose()
  forDeviceModels: string[];

  @Expose()
  claimedBy?: string;

  @Expose()
  claimedAt?: Date;

  @Expose()
  clientName?: string;

  @Expose()
  serialNumber?: string;

  @Expose()
  collectedBy?: string;

  @Expose()
  collectedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
