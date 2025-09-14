import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartStatus } from '../part-status.enum';

export class CreatePartDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  forDeviceModels: string[];

  @ApiPropertyOptional({ enum: PartStatus })
  @IsEnum(PartStatus)
  @IsOptional()
  status?: PartStatus;
}
