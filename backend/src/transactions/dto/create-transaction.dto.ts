import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  ValidateIf,
} from 'class-validator'
import { TransactionType } from '../transaction-type.enum'

export class CreateTransactionDto {
  @ApiProperty({ type: String, format: 'uuid', required: false })
  @ValidateIf(o => !o.tonerId)
  @IsUUID()
  @IsOptional()
  partId?: string

  @ApiProperty({ type: String, format: 'uuid', required: false })
  @ValidateIf(o => !o.partId)
  @IsUUID()
  @IsOptional()
  tonerId?: string

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  userId: string

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  quantityDelta: number

  @ApiPropertyOptional({ type: String, description: 'Optional notes/details' })
  @IsOptional()
  @IsString()
  details?: string
}
