// src/parts/parts.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Part } from '../entities/part.entity'
import { CreatePartDto } from './dto/create-part.dto'
import { UpdatePartDto } from './dto/update-part.dto'
import { PartStatus } from '../entities/part-status.enum'
import { User } from '../users/user.entity'

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  /**
   * Create a new Part (default: AVAILABLE)
   */
  async create(dto: CreatePartDto): Promise<Part> {
    const part = this.partRepo.create({
      ...dto,
      status: PartStatus.AVAILABLE,
    })
    return this.partRepo.save(part)
  }

  /**
   * Fetch all parts, including who claimed them
   */
  async findAll(): Promise<Part[]> {
    return this.partRepo.find({
      relations: ['claimedBy'],
    })
  }

  /**
   * Fetch parts by status, including who claimed them
   */
  async findByStatus(status: PartStatus): Promise<Part[]> {
    return this.partRepo.find({
      where: { status },
      relations: ['claimedBy'],
    })
  }

  /**
   * Fetch a single part by ID, including who claimed it
   */
  async findOne(id: string): Promise<Part> {
    const part = await this.partRepo.findOne({
      where: { id },
      relations: ['claimedBy'],
    })
    if (!part) {
      throw new NotFoundException(`Part with id ${id} not found`)
    }
    return part
  }

  /**
   * Update an existing part
   */
  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id)
    Object.assign(part, dto)
    return this.partRepo.save(part)
  }

  /**
   * Remove a part (and optionally log reason)
   */
  async removeWithReason(
    id: string,
    userId: string,
    userEmail: string,
    reason: string,
  ): Promise<void> {
    const part = await this.findOne(id)
    // (optionally record userId, userEmail, reason in audit log)
    await this.partRepo.remove(part)
  }

  /**
   * ENGINEER: claim an AVAILABLE part for pickup
   */
  async claimPart(
    id: string,
    userId: string,
    userEmail: string,
  ): Promise<Part> {
    const part = await this.findOne(id)

    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part is not available to claim')
    }

    // update status, claimed_by_user_id and claimed_at in one SQL
    await this.partRepo
      .createQueryBuilder()
      .update(Part)
      .set({
        status: PartStatus.PENDING_COLLECTION,
        claimedById: userId,
        claimedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :id', { id })
      .execute()

    // re-fetch with relation so claimedBy is hydrated
    return this.findOne(id)
  }



  /**
   * ENGINEER: request an out-of-stock part
   */
  async requestPart(
    id: string,
    userId: string,
    userEmail: string,
  ): Promise<Part> {
    const part = await this.findOne(id)

    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part cannot be requested')
    }

    part.status               = PartStatus.REQUESTED
    part.requestedByUserId    = userId
    part.requestedByUserEmail = userEmail
    part.requestedAtTimestamp = new Date()

    await this.partRepo.save(part)

    // re-fetch including `claimedBy` (although null here)
    return this.findOne(id)
  }

  /**
   * ENGINEER: return a previously claimed part back to AVAILABLE
   */
  async returnPart(
    id: string,
    userId: string,
    userEmail: string,
    reason: string,
  ): Promise<Part> {
    const part = await this.findOne(id)

    if (part.status !== PartStatus.PENDING_COLLECTION) {
      throw new BadRequestException('Part is not currently reserved')
    }

    part.status      = PartStatus.AVAILABLE
    part.claimedById = undefined
    part.claimedAt   = undefined

    await this.partRepo.save(part)

    // re-fetch so relation state is correct
    return this.findOne(id)
  }
}
