import { ApiProperty } from '@nestjs/swagger';

export class StrippedPartResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  partId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  deviceId: string;

  @ApiProperty()
  partName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  strippedAt: string;
}
