import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartTransactionType } from '../transaction-type.enum';
import { Part } from '../../parts/part.entity';
import { User } from '../../users/user.entity';
import { PartTransaction } from '../part-transaction.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';

// DTO for recent transactions query
export class RecentTransactionsQueryDto {
  @ApiProperty({ type: Number, required: false, example: 12 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  hours?: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Comma-separated transaction types (e.g. claim,collect,request)',
  })
  @IsOptional()
  @IsString()
  types?: string;
}

export class TransactionResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: () => Part })
  part: Part;

  @ApiProperty({ enum: PartTransactionType })
  type: PartTransactionType;

  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: 'number' })
  quantityDelta: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  constructor(tx: PartTransaction) {
    this.id = tx.id;
    this.part = tx.part;
    this.type = tx.type;
    this.user = tx.user;
    this.quantityDelta = tx.quantityDelta;
    this.createdAt = tx.createdAt;
  }
}
