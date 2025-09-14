import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartStatus } from '../part-status.enum';

export class PartDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  partNumber: string;

  @ApiProperty({ type: [String] })
  forDeviceModels: string[];

  @ApiProperty({ enum: PartStatus })
  status: PartStatus;

  @ApiPropertyOptional()
  claimedByUserId?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  claimedAt?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAtTimestamp: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAtTimestamp: string;
}
