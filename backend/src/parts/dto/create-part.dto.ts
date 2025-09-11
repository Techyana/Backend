// src/parts/dto/create-part.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
} from 'class-validator';

export class CreatePartDto {
  @ApiProperty({
    description: 'Human-readable name of this part',
    example: 'Fuser Unit Assembly',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique manufacturer part number',
    example: 'D232-4069',
  })
  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @ApiProperty({
    description: 'List of device models this part is compatible with',
    type: [String],
    example: ['MP C3003', 'MP C4504'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  forDeviceModels: string[];

  @ApiProperty({
    description: 'Initial stock quantity for this part',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
