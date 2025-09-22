// src/parts/dto/part-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Part } from '../part.entity'
import { PartStatus } from '../part-status.enum'

export class PartResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() partNumber: string
  @ApiProperty({ type: [String] }) forDeviceModels: string[]
  @ApiProperty() quantity: number
  @ApiProperty({ enum: PartStatus }) status: PartStatus

  @ApiPropertyOptional() claimedByName?: string | null
  @ApiPropertyOptional({ type: String, format: 'date-time' }) claimedAt?: Date | null

  @ApiProperty({ type: String, format: 'date-time' }) createdAtTimestamp: Date
  @ApiProperty({ type: String, format: 'date-time' }) updatedAtTimestamp: Date

  constructor(part: Part) {
    this.id = part.id
    this.name = part.name
    this.partNumber = part.partNumber
    this.forDeviceModels = part.forDeviceModels
    this.quantity = part.quantity
    this.status = part.status
    this.claimedByName = part.claimedBy ? part.claimedBy.name : null
    this.claimedAt = part.claimedAt ?? null
    this.createdAtTimestamp = part.createdAtTimestamp
    this.updatedAtTimestamp = part.updatedAtTimestamp
  }
}
