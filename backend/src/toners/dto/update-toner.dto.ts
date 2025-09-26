import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class UpdateTonerDto {
  @IsOptional()
  @IsString()
  edpCode?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsInt()
  yield?: number;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forDeviceModels?: string[];
}
