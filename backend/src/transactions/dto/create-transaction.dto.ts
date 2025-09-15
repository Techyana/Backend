// src/transactions/dto/create-transaction.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator'
import { PartTransactionType } from '../transaction-type.enum'

export class CreateTransactionDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  partId: string

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  userId: string

  @ApiProperty({ enum: PartTransactionType })
  @IsEnum(PartTransactionType)
  type: PartTransactionType

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  quantityDelta: number

  @ApiPropertyOptional({ type: String, description: 'Optional notes/details' })
  @IsOptional()
  @IsString()
  details?: string
}
