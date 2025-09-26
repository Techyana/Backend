import { Expose } from 'class-transformer';

export class TonerResponseDto {
  @Expose()
  id: number;

  @Expose()
  edp: string;

  @Expose()
  color: string;

  @Expose()
  deviceModel: string;

  @Expose()
  quantity: number;

  @Expose()
  yield?: number;

  @Expose()
  from: string;

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
