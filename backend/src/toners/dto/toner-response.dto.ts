import { ApiProperty } from '@nestjs/swagger';
import { TonerColor } from '../toner-color.enum';

export class TonerResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  edpCode: string;

  @ApiProperty({ enum: TonerColor })
  color: TonerColor;

  @ApiProperty({ type: Number })
  yield: number;

  @ApiProperty({ type: Number })
  stock: number;

  @ApiProperty({ type: [String] })
  forDeviceModels: string[];
}
