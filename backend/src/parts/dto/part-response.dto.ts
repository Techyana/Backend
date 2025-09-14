import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartStatus } from '../../entities/part-status.enum';
import { Part } from '../../entities/part.entity';

export class PartResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  partNumber: string;

  @ApiProperty({ type: [String] })
  forDeviceModels: string[];

  @ApiProperty()
  quantity: number;

  @ApiProperty({ enum: PartStatus })
  status: PartStatus;

  @ApiPropertyOptional()
  claimedByName?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  claimedAt?: Date | null;

  @ApiPropertyOptional()
  requestedByName?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  requestedAtTimestamp?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAtTimestamp: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAtTimestamp: Date;

  constructor(part: Part, actorName?: string) {
    this.id = part.id;
    this.name = part.name;
    this.partNumber = part.partNumber;
    this.forDeviceModels = part.forDeviceModels;
    this.quantity = part.quantity;
    this.status = part.status;
    this.claimedByName = part.claimedBy?.name ?? actorName ?? null;
    this.claimedAt = part.claimedAt ?? null;
    this.requestedByName = actorName ?? null;
    this.requestedAtTimestamp = part.requestedAtTimestamp ?? null;
    this.createdAtTimestamp = part.createdAtTimestamp;
    this.updatedAtTimestamp = part.updatedAtTimestamp;
  }
}
