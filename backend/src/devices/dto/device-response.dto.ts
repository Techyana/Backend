import { ApiProperty } from '@nestjs/swagger'
import { DeviceStatus } from '../device-status.enum'
import { StrippedPart } from '../../stripped-parts/stripped-part.entity'

export class DeviceResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string

  @ApiProperty({ example: 'IMC3000' })
  model: string

  @ApiProperty({ example: 'RZ123456' })
  serialNumber: string

  @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.APPROVED_FOR_DISPOSAL })
  status: DeviceStatus

  @ApiProperty({ example: 'Acme Corp', required: false })
  customerName?: string

  @ApiProperty({ example: 'Good', required: false })
  condition?: string

  @ApiProperty({ example: 'Device ready for disposal', required: false })
  comments?: string

  @ApiProperty({ example: 'End of contract', required: false })
  removalReason?: string

  @ApiProperty({ type: () => [StrippedPart], required: false })
  strippedParts: StrippedPart[]

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  createdAtTimestamp: Date

  @ApiProperty({ example: '2024-09-13T10:00:00Z' })
  updatedAtTimestamp: Date
}
