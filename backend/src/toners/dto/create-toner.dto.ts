import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateTonerDto {
  @IsString()
  edpCode: string;

  @IsString()
  color: string;

  @IsString()
  model: string;

  @IsInt()
  stock: number;

  @IsOptional()
  @IsInt()
  yield?: number;

  @IsString()
  from: string;

  @IsArray()
  @IsString({ each: true })
  forDeviceModels: string[];
}
