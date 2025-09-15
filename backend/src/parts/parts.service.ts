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
import { PartTransactionType } from '../transactions/transaction-type.enum'

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,

    @InjectRepository(PartTransaction)
    private readonly txRepo: Repository<PartTransaction>,
  ) {}

  async create(dto: CreatePartDto): Promise<Part> {
    const part = this.partRepo.create({
      ...dto,
      status: PartStatus.AVAILABLE,
    })
    return this.partRepo.save(part)
  }

  async findAll(): Promise<Array<Part & { claimedByName?: string; claimedAt?: Date }>> {
    const parts = await this.partRepo.find({
      relations: ['transactions', 'transactions.user'],
      order: { createdAtTimestamp: 'DESC' },
    })

    return parts.map((p) => {
      const latest = p.transactions
        .filter((tx) =>
          tx.type === PartTransactionType.REQUEST ||
          tx.type === PartTransactionType.CLAIM
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

      return {
        ...p,
        claimedByName: latest?.user?.name,
        claimedAt: latest?.createdAt,
      }
    })
  }

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
          tx.type === PartTransactionType.REQUEST ||
          tx.type === PartTransactionType.CLAIM
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

      return {
        ...p,
        claimedByName: latest?.user?.name,
        claimedAt: latest?.createdAt,
      }
    })
  }

  async findOne(
    id: string,
  ): Promise<Part & { claimedByName?: string; claimedAt?: Date }> {
    const p = await this.partRepo.findOne({
      where: { id },
      relations: ['transactions', 'transactions.user'],
    })
    if (!p) throw new NotFoundException(`Part ${id} not found`)

    const latest = p.transactions
      .filter((tx) =>
        tx.type === PartTransactionType.REQUEST ||
        tx.type === PartTransactionType.CLAIM
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

    return {
      ...p,
      claimedByName: latest?.user?.name,
      claimedAt: latest?.createdAt,
    }
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.partRepo.preload({ id, ...dto })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    return this.partRepo.save(part)
  }

  async removeWithReason(
    id: string,
    userId: string,
    userEmail: string,
    reason: string,
  ): Promise<void> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    await this.partRepo.remove(part)
  }

  async claimPart(id: string, userId: string): Promise<Part> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part is not available to claim')
    }

    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: PartTransactionType.CLAIM,
      quantityDelta: 1,
    })
    await this.txRepo.save(tx)

    part.status = PartStatus.PENDING_COLLECTION
    await this.partRepo.save(part)

    return this.findOne(id)
  }

  async requestPart(id: string, userId: string): Promise<Part> {
    const part = await this.partRepo.findOneBy({ id })
    if (!part) throw new NotFoundException(`Part ${id} not found`)
    if (part.status !== PartStatus.AVAILABLE) {
      throw new BadRequestException('Part cannot be requested')
    }

    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: PartTransactionType.REQUEST,
      quantityDelta: 1,
    })
    await this.txRepo.save(tx)

    part.status = PartStatus.REQUESTED
    await this.partRepo.save(part)

    return this.findOne(id)
  }

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

    const tx = this.txRepo.create({
      part,
      user: { id: userId } as any,
      type: PartTransactionType.COLLECT,
      quantityDelta: -1,
    })
    await this.txRepo.save(tx)

    part.status = PartStatus.AVAILABLE
    await this.partRepo.save(part)

    return this.findOne(id)
  }
}
