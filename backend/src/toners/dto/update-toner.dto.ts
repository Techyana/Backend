import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateTonerDto {
  @IsOptional()
  @IsString()
  edp?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsInt()
  yield?: number;

  @IsOptional()
  @IsString()
  from?: string;
}
