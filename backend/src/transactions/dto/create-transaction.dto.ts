import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsInt } from 'class-validator';
import { PartTransactionType } from '../transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ type: String, format: 'uuid', description: 'ID of the part' })
  @IsUUID()
  partId: string;

  @ApiProperty({ type: String, format: 'uuid', description: 'ID of the user' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: PartTransactionType, description: 'Type of transaction' })
  @IsEnum(PartTransactionType)
  type: PartTransactionType;

  @ApiProperty({ type: Number, description: 'Quantity change (delta)' })
  @IsInt()
  quantityDelta: number;
}
