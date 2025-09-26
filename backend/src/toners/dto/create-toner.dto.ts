import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTonerDto {
  @IsString()
  edp: string;

  @IsString()
  color: string;

  @IsString()
  deviceModel: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsInt()
  yield?: number;

  @IsString()
  from: string;
}
