// src/parts/dto/part-response.dto.ts

import { PartStatus } from '../../entities/part-status.enum'
import { Part } from '../../entities/part.entity'

export class PartResponseDto {
  id: string
  name: string
  partNumber: string
  forDeviceModels: string[]
  quantity: number
  status: PartStatus
  claimedByName?: string | null
  claimedAt?: Date | null
  requestedByName?: string | null
  requestedAtTimestamp?: Date | null
  createdAtTimestamp: Date
  updatedAtTimestamp: Date

  constructor(part: Part, actorName?: string) {
    this.id                    = part.id
    this.name                  = part.name
    this.partNumber            = part.partNumber
    this.forDeviceModels       = part.forDeviceModels
    this.quantity              = part.quantity
    this.status                = part.status
    // relation’s name wins; fallback to actorName if provided
    this.claimedByName         = part.claimedBy?.name ?? actorName ?? null
    this.claimedAt             = part.claimedAt ?? null
    // for request, actorName is the requester
    this.requestedByName       = actorName ?? null
    this.requestedAtTimestamp  = part.requestedAtTimestamp ?? null
    this.createdAtTimestamp    = part.createdAtTimestamp
    this.updatedAtTimestamp    = part.updatedAtTimestamp
  }
}
