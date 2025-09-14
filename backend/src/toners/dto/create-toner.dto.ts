import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, Min, IsArray, ArrayNotEmpty } from 'class-validator';
import { TonerColor } from '../toner-color.enum';

export class CreateTonerDto {
  @ApiProperty({ type: String, description: 'Model name of the toner' })
  @IsString()
  model: string;

  @ApiProperty({ type: String, description: 'EDP code of the toner' })
  @IsString()
  edpCode: string;

  @ApiProperty({ enum: TonerColor, description: 'Color of the toner' })
  @IsEnum(TonerColor)
  color: TonerColor;

  @ApiProperty({ type: Number, description: 'Page yield of the toner' })
  @IsInt()
  @Min(1)
  yield: number;

  @ApiProperty({ type: Number, description: 'Initial stock count' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ type: [String], description: 'Compatible device models' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  forDeviceModels: string[];
}
