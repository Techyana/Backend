import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import { IsOptional, IsEnum, IsString, IsNumber, IsDateString } from 'class-validator';
import { DeviceStatus } from '../device-status.enum';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsNumber()
  pageCount?: number;

  @IsOptional()
  @IsDateString()
  lastServicedAt?: string;
}
