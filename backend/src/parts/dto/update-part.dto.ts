// src/parts/dto/update-part.dto.ts

import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PartStatus } from '../part-status.enum'

export class UpdatePartDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  partNumber?: string

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  forDeviceModels?: string[]

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number

  @ApiPropertyOptional({ enum: PartStatus })
  @IsEnum(PartStatus)
  @IsOptional()
  status?: PartStatus
}
