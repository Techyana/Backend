// src/parts/dto/part.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Part } from '../part.entity'
import { PartStatus } from '../part-status.enum'

export class PartDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() partNumber: string
  @ApiProperty({ type: [String] }) forDeviceModels: string[]
  @ApiProperty() quantity: number
  @ApiProperty({ enum: PartStatus }) status: PartStatus

  @ApiPropertyOptional({ type: 'string', format: 'uuid', nullable: true })
  claimedByUserId?: string | null

  @ApiPropertyOptional({ type: 'string', nullable: true })
  claimedByName?: string | null

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  claimedAt?: Date | null

  @ApiProperty({ type: 'boolean', default: false })
  collected: boolean

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  collectedAt?: Date | null

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAtTimestamp: Date

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAtTimestamp: Date

  // Optional convenience fields for UI (derived)
  @ApiPropertyOptional({ type: 'string', format: 'uuid', nullable: true })
  collectedByUserId?: string | null

  @ApiPropertyOptional({ type: 'string', nullable: true })
  collectedByName?: string | null

  constructor(part: Part) {
    this.id = part.id
    this.name = part.name
    this.partNumber = part.partNumber
    this.forDeviceModels = part.forDeviceModels
    this.quantity = part.quantity
    this.status = part.status

    this.claimedByUserId = part.claimedById ?? null
    this.claimedByName = part.claimedBy ? part.claimedBy.name : null
    this.claimedAt = part.claimedAt ?? null

    this.collected = part.collected
    this.collectedAt = part.collectedAt ?? null

    // Derive collectedBy from claimant if collected
    this.collectedByUserId = part.collected ? part.claimedById ?? null : null
    this.collectedByName = part.collected && part.claimedBy ? part.claimedBy.name : null

    this.createdAtTimestamp = part.createdAtTimestamp
    this.updatedAtTimestamp = part.updatedAtTimestamp
  }
}
