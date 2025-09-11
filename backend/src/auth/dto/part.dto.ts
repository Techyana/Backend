// src/dto/part.dto.ts
import { PartStatus } from '../../entities/part-status.enum';

export class PartDto {
  id: string;
  name: string;
  partNumber: string;
  forDeviceModels: string[];
  status: PartStatus;
  claimedByUserId?: string;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
