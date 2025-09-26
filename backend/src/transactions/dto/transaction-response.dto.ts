import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType } from '../transaction-type.enum';
import { Part } from '../../parts/part.entity';
import { Toner } from '../../toners/toner.entity';
import { User } from '../../users/user.entity';
import { PartTransaction } from '../part-transaction.entity';
import { TonerTransaction } from '../toner-transaction.entity';
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

  @ApiProperty({ type: () => Part, required: false })
  @IsOptional()
  part?: Part;

  @ApiProperty({ type: () => Toner, required: false })
  @IsOptional()
  toner?: Toner;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: 'number' })
  quantityDelta: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  constructor(tx: PartTransaction | TonerTransaction) {
    this.id = tx.id;
    if ('part' in tx) {
      this.part = tx.part;
    }
    if ('toner' in tx) {
      this.toner = tx.toner;
    }
    this.type = tx.type;
    this.user = tx.user;
    this.quantityDelta = tx.quantityDelta;
    this.createdAt = tx.createdAt;
  }
}
