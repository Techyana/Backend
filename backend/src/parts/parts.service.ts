// src/parts/parts.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Part } from './part.entity'
import { PartTransaction } from '../transactions/part-transaction.entity'
import { CreatePartDto } from './dto/create-part.dto'
import { UpdatePartDto } from './dto/update-part.dto'
import { PartStatus } from './part-status.enum'
import { TransactionType } from '../transactions/transaction-type.enum'

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,

    @InjectRepository(PartTransaction)
    private readonly txRepo: Repository<PartTransaction>,
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
   * Fetch all parts, each with its latest claim info
   */
  async findAll(): Promise<Array<Part & { claimedByName?: string; claimedAt?: Date }>> {
    const parts = await this.partRepo.find({
      relations: ['transactions', 'transactions.user'],
      order: { createdAtTimestamp: 'DESC' },
    })

    return parts.map((p) => {
      // pick newest REQUEST or CLAIM transaction
      const latest = p.transactions
        .filter((tx) =>
          tx.type === TransactionType.REQUEST ||
          tx.type === TransactionType.CLAIM
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

      return {
        ...p,
        claimedByName: latest?.user?.name,
        claimedAt: latest?.createdAt,
      }
    })
  }

  /**
   * Fetch parts by status, each with its latest claim info
   */
  async findByStatus(
    status: PartStatus,
  ): Promise<Array<Part & { claimedByName?: string; claimedAt?: Date }>> {
    const parts = await this.partRepo.find({
      where: { status },
      relations: ['transactions', 'transactions.user'],
      order: { createdAtTimestamp: 'DESC' },
    })

    return parts.map((p) => {
      const latest = p.transactions
        .filter((tx) =>
          tx.type === TransactionType.REQUEST ||
          tx.type === TransactionType.CLAIM
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

      return {
        ...p,
        claimedByName: latest?.user?.name,
        claimedAt: latest?.createdAt,
      }
    })
  }

  /**
   * Fetch a single part by ID, with latest claim info
   */
  async findOne(id: string): Promise<Part & { claimedByName?: string; claimedAt?: Date }> {
    const p = await this.partRepo.findOne({
      where: { id },
      relations: ['transactions', 'transactions.user'],
    })
    if (!p) throw new NotFoundException(`Part ${id} not found`)

    const latest = p.transactions
      .filter((tx) =>
        tx.type === TransactionType.REQUEST ||
        tx.type === TransactionType.CLAIM
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

    return {
      ...p,
      claimedByName: latest?.user?.name,
      claimedAt: latest?.createdAt,
    }
  }

  /**
   * Update an existing part
   */
  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.partRepo.preload({ id, ...dto })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
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
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    // TODO: audit log: userId, userEmail, reason
    await this.partRepo.remove(part)
  }

  /**
   * ENGINEER: claim an available part
   */
  async claimPart(id: string, userId: string): Promise<Part> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part is not available to claim')
    }

    // record the transaction
    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: TransactionType.CLAIM,
      quantityDelta: 1,
    })
    await this.txRepo.save(tx)

    // update part status
    part.status = PartStatus.PENDING_COLLECTION
    await this.partRepo.save(part)

    return this.findOne(id)
  }

  /**
   * ENGINEER: request an out-of-stock part
   */
  async requestPart(id: string, userId: string): Promise<Part> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part cannot be requested')
    }

    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: TransactionType.REQUEST,
      quantityDelta: 1,
    })
    await this.txRepo.save(tx)

    part.status = PartStatus.REQUESTED
    await this.partRepo.save(part)

    return this.findOne(id)
  }

  /**
   * ENGINEER: return a previously claimed part
   */
  async returnPart(
    id: string,
    userId: string,
    userEmail: string,
    reason: string,
  ): Promise<Part> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    if (part.status !== PartStatus.PENDING_COLLECTION) {
      throw new BadRequestException('Part is not currently reserved')
    }

    // record the return transaction
    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: TransactionType.COLLECTION,
      quantityDelta: -1,
    })
    await this.txRepo.save(tx)

    part.status = PartStatus.AVAILABLE
    await this.partRepo.save(part)

    return this.findOne(id)
  }
}
