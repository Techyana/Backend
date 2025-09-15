// src/transactions/transactions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PartTransaction } from './part-transaction.entity'
import { Part } from '../parts/part.entity'
import { User } from '../users/user.entity'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { PartTransactionType } from './transaction-type.enum'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PartTransaction)
    private readonly transactionRepo: Repository<PartTransaction>,
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<PartTransaction[]> {
    return this.transactionRepo.find({
      relations: ['part', 'user'],
      order: { createdAt: 'DESC' },
    })
  }

  async findRecent(
    hours: number,
    types?: PartTransactionType[],
  ): Promise<PartTransaction[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    const qb = this.transactionRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.part', 'part')
      .leftJoinAndSelect('tx.user', 'user')
      .where('tx.createdAt >= :since', { since })

    if (types?.length) {
      qb.andWhere('tx.type IN (:...types)', { types })
    }

    return qb.orderBy('tx.createdAt', 'DESC').getMany()
  }

  async getRecent(hours: number): Promise<PartTransaction[]> {
    return this.findRecent(hours)
  }

  async getRecentCollections(hours: number): Promise<PartTransaction[]> {
    return this.findRecent(hours, [PartTransactionType.COLLECT])
  }

  async findOne(id: string): Promise<PartTransaction> {
    const tx = await this.transactionRepo.findOne({
      where: { id },
      relations: ['part', 'user'],
    })
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`)
    return tx
  }

  async create(dto: CreateTransactionDto): Promise<PartTransaction> {
    const part = await this.partRepo.findOne({ where: { id: dto.partId } })
    if (!part) throw new NotFoundException('Part not found')
    const user = await this.userRepo.findOne({ where: { id: dto.userId } })
    if (!user) throw new NotFoundException('User not found')

    const tx = this.transactionRepo.create({
      part,
      user,
      type: dto.type,
      quantityDelta: dto.quantityDelta,
      details: dto.details,
    })
    return this.transactionRepo.save(tx)
  }
}
