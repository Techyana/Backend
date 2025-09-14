import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class CreateStrippedPartDto {
  @ApiProperty({ type: String, format: 'uuid', description: 'ID of the part being stripped' })
  @IsUUID()
  partId: string;

  @ApiProperty({ type: String, format: 'uuid', description: 'ID of the device from which the part is stripped' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ type: String, description: 'Name of the part being stripped' })
  @IsString()
  partName: string;
}
