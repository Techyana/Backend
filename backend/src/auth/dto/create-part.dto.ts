// src/dto/create-part.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { PartStatus } from '../../entities/part-status.enum';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  forDeviceModels?: string[];

  @IsEnum(PartStatus)
  @IsOptional()
  status?: PartStatus;

  @IsUUID()
  @IsOptional()
  claimedByUserId?: string;
}
