import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length, IsOptional } from 'class-validator'

export class CreateDeviceDto {
  @ApiProperty({ example: 'IMC3000' })
  @IsString()
  @Length(1, 100)
  model: string

  @ApiProperty({ example: 'RZ123456' })
  @IsString()
  @Length(1, 100)
  serialNumber: string

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsOptional()
  @IsString()
  customerName?: string

  @ApiProperty({ example: 'Good', required: false })
  @IsOptional()
  @IsString()
  condition?: string

  @ApiProperty({ example: 'Device ready for disposal', required: false })
  @IsOptional()
  @IsString()
  comments?: string
}
