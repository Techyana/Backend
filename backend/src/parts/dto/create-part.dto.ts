// src/parts/dto/create-part.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PartStatus } from '../part-status.enum'

export class CreatePartDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partNumber: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  forDeviceModels: string[]

  @ApiProperty({ type: Number, minimum: 0, default: 0 })
  @IsInt()
  @Min(0)
  quantity: number

  @ApiPropertyOptional({ enum: PartStatus })
  @IsEnum(PartStatus)
  @IsOptional()
  status?: PartStatus
}
