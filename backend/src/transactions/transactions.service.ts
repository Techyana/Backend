import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PartTransaction } from './part-transaction.entity'
import { TonerTransaction } from './toner-transaction.entity'
import { Part } from '../parts/part.entity'
import { Toner } from '../toners/toner.entity'
import { User } from '../users/user.entity'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { TransactionType } from './transaction-type.enum'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PartTransaction)
    private readonly partTransactionRepo: Repository<PartTransaction>,
    @InjectRepository(TonerTransaction)
    private readonly tonerTransactionRepo: Repository<TonerTransaction>,
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
    @InjectRepository(Toner)
    private readonly tonerRepo: Repository<Toner>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Array<PartTransaction | TonerTransaction>> {
    const partTxs = await this.partTransactionRepo.find({
      relations: ['part', 'user'],
      order: { createdAt: 'DESC' },
    })
    const tonerTxs = await this.tonerTransactionRepo.find({
      relations: ['toner', 'user'],
      order: { createdAt: 'DESC' },
    })
    return [...partTxs, ...tonerTxs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findRecent(
    hours: number,
    types?: TransactionType[],
  ): Promise<Array<PartTransaction | TonerTransaction>> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    const partQb = this.partTransactionRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.part', 'part')
      .leftJoinAndSelect('tx.user', 'user')
      .where('tx.createdAt >= :since', { since })

    const tonerQb = this.tonerTransactionRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.toner', 'toner')
      .leftJoinAndSelect('tx.user', 'user')
      .where('tx.createdAt >= :since', { since })

    if (types?.length) {
      partQb.andWhere('tx.type IN (:...types)', { types })
      tonerQb.andWhere('tx.type IN (:...types)', { types })
    }

    const partTxs = await partQb.orderBy('tx.createdAt', 'DESC').getMany()
    const tonerTxs = await tonerQb.orderBy('tx.createdAt', 'DESC').getMany()
    return [...partTxs, ...tonerTxs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getRecent(hours: number): Promise<Array<PartTransaction | TonerTransaction>> {
    return this.findRecent(hours)
  }

  async getRecentCollections(hours: number): Promise<Array<PartTransaction | TonerTransaction>> {
    return this.findRecent(hours, [TransactionType.COLLECT])
  }

  async findOne(id: string): Promise<PartTransaction | TonerTransaction | null> {
    let tx: PartTransaction | TonerTransaction | null = await this.partTransactionRepo.findOne({
      where: { id },
      relations: ['part', 'user'],
    });
    if (tx) return tx;
    tx = await this.tonerTransactionRepo.findOne({
      where: { id },
      relations: ['toner', 'user'],
    });
    return tx;
  }

  async create(dto: CreateTransactionDto): Promise<PartTransaction | TonerTransaction> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } })
    if (!user) throw new NotFoundException('User not found')

    if (dto.partId) {
      const part = await this.partRepo.findOne({ where: { id: dto.partId } })
      if (!part) throw new NotFoundException('Part not found')
      const tx = this.partTransactionRepo.create({
        part,
        user,
        type: dto.type,
        quantityDelta: dto.quantityDelta,
        details: dto.details,
      })
      return this.partTransactionRepo.save(tx)
    } else if (dto.tonerId) {
      const toner = await this.tonerRepo.findOne({ where: { id: dto.tonerId } })
      if (!toner) throw new NotFoundException('Toner not found')
      const tx = this.tonerTransactionRepo.create({
        toner,
        user,
        type: dto.type,
        quantityDelta: dto.quantityDelta,
        details: dto.details,
      })
      return this.tonerTransactionRepo.save(tx)
    } else {
      throw new NotFoundException('Either partId or tonerId must be provided')
    }
  }
}
