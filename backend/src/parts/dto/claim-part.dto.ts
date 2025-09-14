import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ClaimPartDto {
  @ApiProperty({ type: String, format: 'uuid', description: 'ID of the part to claim' })
  @IsUUID()
  partId: string;
}
