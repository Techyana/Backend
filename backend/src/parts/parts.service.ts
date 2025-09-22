import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Part } from './part.entity'
import { PartStatus } from './part-status.enum'
import { CreatePartDto } from './dto/create-part.dto'
import { UpdatePartDto } from './dto/update-part.dto'
import { PartTransaction } from '../transactions/part-transaction.entity'
import { PartTransactionType } from '../transactions/transaction-type.enum'
import { User } from '../users/user.entity'
import { Role } from '../users/role.enum'
import { NotificationService } from '../notifications/notifications.service'
import { NotificationType } from '../notifications/notification-type.enum'

@Injectable()
export class PartsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Part) private readonly partRepo: Repository<Part>,
    @InjectRepository(PartTransaction) private readonly txRepo: Repository<PartTransaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly notifications: NotificationService,
  ) {}

  async create(dto: CreatePartDto): Promise<Part> {
    const part = this.partRepo.create({
      name: dto.name,
      partNumber: dto.partNumber,
      forDeviceModels: dto.forDeviceModels,
      quantity: dto.quantity ?? 0,
      status: dto.status ?? PartStatus.AVAILABLE,
    })
    const saved = await this.partRepo.save(part)

    // Notify all engineers about a new available part
    const engineers = await this.userRepo.find({ where: { role: Role.ENGINEER } })
    await Promise.all(
      engineers.map((eng) =>
        this.notifications.create({
          userId: eng.id,
          type: NotificationType.PART_AVAILABLE,
          message: `New part available: ${saved.name} (${saved.partNumber})`,
          metadata: { partId: saved.id, quantity: saved.quantity },
        }),
      ),
    )

    return this.findOne(saved.id)
  }

  async findAll(): Promise<Part[]> {
    return this.partRepo.find({ relations: ['claimedBy'] , order: { createdAtTimestamp: 'DESC' } })
  }

  async findByStatus(status: PartStatus): Promise<Part[]> {
    return this.partRepo.find({ where: { status }, relations: ['claimedBy'], order: { createdAtTimestamp: 'DESC' } })
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partRepo.findOne({ where: { id }, relations: ['claimedBy'] })
    if (!part) throw new NotFoundException('Part not found')
    return part
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id)

    // Prevent editing a collected part
    if (part.collected) {
      throw new ForbiddenException('Collected parts cannot be updated')
    }

    Object.assign(part, dto)
    await this.partRepo.save(part)
    return this.findOne(id)
  }

  async removeWithReason(id: string, performedByUserId: string, performedByEmail: string, reason?: string): Promise<void> {
    const part = await this.findOne(id)
    await this.dataSource.transaction(async (manager) => {
      await manager.remove(Part, part)

      // Notify all engineers about removal
      const engineers = await manager.getRepository(User).find({ where: { role: Role.ENGINEER } })
      await Promise.all(
        engineers.map((eng) =>
          this.notifications.create({
            userId: eng.id,
            type: NotificationType.GENERAL,
            message: `Part removed: ${part.name} (${part.partNumber})`,
            metadata: { partId: part.id, reason: reason || 'No reason provided', removedBy: performedByEmail },
          }),
        ),
      )
    })
  }

  // Engineer requests a part (optional flow)
  async requestPart(id: string, userId: string): Promise<Part> {
    const [part, user] = await Promise.all([this.findOne(id), this.userRepo.findOne({ where: { id: userId } })])
    if (!user) throw new NotFoundException('User not found')
    if (part.status !== PartStatus.AVAILABLE) throw new BadRequestException('Part not available to request')

    return await this.dataSource.transaction(async (manager) => {
      // Record transaction
      const tx = manager.create(PartTransaction, {
        part,
        user,
        type: PartTransactionType.REQUEST,
        quantityDelta: 0,
        details: `Requested by ${user.email}`,
      })
      await manager.save(tx)

      // Optionally notify admins about the request
      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] })
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part request: ${part.name} by ${user.name}`,
            metadata: { partId: part.id },
          }),
        ),
      )

      return this.findOne(id)
    })
  }

  // Engineer claims a part
  async claimPart(id: string, userId: string): Promise<Part> {
    const [part, user] = await Promise.all([this.findOne(id), this.userRepo.findOne({ where: { id: userId } })])
    if (!user) throw new NotFoundException('User not found')
    if (part.status !== PartStatus.AVAILABLE) throw new BadRequestException('Part not available to claim')

    return await this.dataSource.transaction(async (manager) => {
      part.claimedById = user.id
      part.claimedAt = new Date()
      // Move out of "Available" queue
      // If you have PENDING_COLLECTION in PartStatus, prefer that; fallback to CLAIMED
      part.status = (PartStatus as any).PENDING_COLLECTION ?? PartStatus.CLAIMED

      await manager.save(part)

      const tx = manager.create(PartTransaction, {
        part,
        user,
        type: PartTransactionType.CLAIM,
        quantityDelta: 0,
        details: `Claimed by ${user.email}`,
      })
      await manager.save(tx)

      // Optionally notify admins about claims
      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] })
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part claimed: ${part.name} (${part.partNumber}) by ${user.name}`,
            metadata: { partId: part.id, claimedAt: part.claimedAt },
          }),
        ),
      )

      return this.findOne(id)
    })
  }

  // Engineer returns a claimed part (un-claim)
  async returnPart(id: string, userId: string, userEmail: string, reason?: string): Promise<Part> {
    const [part, user] = await Promise.all([this.findOne(id), this.userRepo.findOne({ where: { id: userId } })])
    if (!user) throw new NotFoundException('User not found')
    if (!part.claimedById) throw new BadRequestException('Part is not claimed')
    if (part.claimedById !== user.id) throw new ForbiddenException('You did not claim this part')

    return await this.dataSource.transaction(async (manager) => {
      part.claimedById = null
      part.claimedBy = null
      part.claimedAt = null
      part.collected = false
      part.collectedAt = null
      part.status = PartStatus.AVAILABLE

      await manager.save(part)

      const tx = manager.create(PartTransaction, {
        part,
        user,
        type: PartTransactionType.RETURN,
        quantityDelta: 0,
        details: `Returned by ${userEmail}${reason ? `: ${reason}` : ''}`,
      })
      await manager.save(tx)

      // Notify admins the claim was returned
      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] })
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part returned: ${part.name} (${part.partNumber}) by ${user.name}`,
            metadata: { partId: part.id, reason: reason || 'No reason provided' },
          }),
        ),
      )

      return this.findOne(id)
    })
  }

  // Engineer confirms collection
  async collectPart(id: string, userId: string): Promise<Part> {
    const [part, user] = await Promise.all([this.findOne(id), this.userRepo.findOne({ where: { id: userId } })])
    if (!user) throw new NotFoundException('User not found')
    if (!part.claimedById) throw new BadRequestException('Part must be claimed before collection')
    if (part.claimedById !== user.id) throw new ForbiddenException('You did not claim this part')
    if (part.collected) throw new BadRequestException('Part already collected')

    return await this.dataSource.transaction(async (manager) => {
      part.collected = true
      part.collectedAt = new Date()
      // Optional: keep status as CLAIMED or mark as a dedicated collected state if exists
      part.status = (PartStatus as any).COLLECTED ?? part.status

      await manager.save(part)

      const tx = manager.create(PartTransaction, {
        part,
        user,
        type: PartTransactionType.COLLECT,
        quantityDelta: -1, // reflects stock movement; adjust per your policy
        details: `Collected by ${user.email}`,
      })
      await manager.save(tx)

      // Notify admins about collection with claimedByName and claimedAt
      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] })
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part collected: ${part.name} by ${user.name}`,
            metadata: { partId: part.id, claimedAt: part.claimedAt, collectedAt: part.collectedAt, claimedByName: user.name },
          }),
        ),
      )

      return this.findOne(id)
    })
  }
}
