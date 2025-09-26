import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import { Part } from './part.entity';
import { PartStatus } from './part-status.enum';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartTransaction } from '../transactions/part-transaction.entity';
import { TransactionType } from '../transactions/transaction-type.enum';
import { User } from '../users/user.entity';
import { Role } from '../users/role.enum';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type.enum';

@Injectable()
export class PartsService {
  private readonly logger = new Logger(PartsService.name);

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
    });
    const saved = await this.partRepo.save(part);

    // notify all engineers about new part
    const engineers = await this.userRepo.find({ where: { role: Role.ENGINEER } });
    await Promise.all(
      engineers.map((eng) =>
        this.notifications.create({
          userId: eng.id,
          type: NotificationType.PART_AVAILABLE,
          message: `New part available: ${saved.name} (${saved.partNumber})`,
          metadata: { partId: saved.id, quantity: saved.quantity },
        }),
      ),
    );

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Part[]> {
    return this.partRepo.find({ relations: ['claimedBy'], order: { createdAtTimestamp: 'DESC' } });
  }

  async findByStatus(status: PartStatus): Promise<Part[]> {
    return this.partRepo.find({ where: { status }, relations: ['claimedBy'], order: { createdAtTimestamp: 'DESC' } });
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partRepo.findOne({ where: { id }, relations: ['claimedBy'] });
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);
    if (part.collected) {
      throw new ForbiddenException('Collected parts cannot be updated');
    }
    Object.assign(part, dto);
    await this.partRepo.save(part);
    return this.findOne(id);
  }

  async removeWithReason(id: string, performedByUserId: string, performedByEmail: string, reason?: string): Promise<void> {
    const part = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.remove(Part, part);
      const engineers = await manager.getRepository(User).find({ where: { role: Role.ENGINEER } });
      await Promise.all(
        engineers.map((eng) =>
          this.notifications.create({
            userId: eng.id,
            type: NotificationType.PART_REMOVED,
            message: `Part removed: ${part.name} (${part.partNumber})`,
            metadata: { partId: part.id, reason: reason || 'No reason provided', removedBy: performedByEmail },
          }),
        ),
      );
    });
  }

  async requestPart(id: string, authUserId: string): Promise<Part> {
    const [part, user] = await Promise.all([this.findOne(id), this.userRepo.findOne({ where: { id: authUserId } })]);
    if (!user) throw new NotFoundException('User not found');
    if (part.status !== PartStatus.AVAILABLE) throw new BadRequestException('Part not available to request');

    return this.dataSource.transaction(async (manager) => {
      const txData: DeepPartial<PartTransaction> = {
        part,
        user,
        type: TransactionType.REQUEST,
        quantityDelta: 0,
        details: `Requested by ${user.email}`,
      };
      const tx = manager.create(PartTransaction, txData);
      await manager.save(tx);

      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part request: ${part.name} by ${user.name}`,
            metadata: { partId: part.id },
          }),
        ),
      );

      return this.findOne(id);
    });
  }

  async claimPart(id: string, authUserId: string): Promise<Part> {
    const [part, user] = await Promise.all([
      this.partRepo.findOne({ where: { id }, relations: ['claimedBy'] }),
      this.userRepo.findOne({ where: { id: authUserId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!part) throw new NotFoundException('Part not found');
    if (part.status !== PartStatus.AVAILABLE) throw new BadRequestException('Part not available to claim');
    if (part.quantity < 1) throw new BadRequestException('No stock available');

    return this.dataSource.transaction(async (manager) => {
      // reload inside tx
      const partForUpdate = await manager.findOne(Part, { where: { id: part.id } });
      if (!partForUpdate) throw new NotFoundException('Part not found during transaction');

      partForUpdate.quantity -= 1;
      partForUpdate.status = PartStatus.PENDING_COLLECTION;
      partForUpdate.claimedById = user.id;
      partForUpdate.claimedBy = user;
      partForUpdate.claimedAt = new Date();
      partForUpdate.collected = false;
      partForUpdate.collectedAt = null;

      await manager.save(partForUpdate);

      const txData: DeepPartial<PartTransaction> = {
        part: partForUpdate,
        user,
        type: TransactionType.CLAIM,
        quantityDelta: -1,
        details: `Claimed by ${user.email}`,
      };
      const tx = manager.create(PartTransaction, txData);
      await manager.save(tx);

      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.PART_CLAIMED,
            message: `Part claimed: ${partForUpdate.name} (${partForUpdate.partNumber}) by ${user.name}`,
            metadata: { partId: partForUpdate.id, claimedAt: partForUpdate.claimedAt, claimedByName: user.name },
          }),
        ),
      );

      const updatedPart = await manager.getRepository(Part).findOne({ where: { id: partForUpdate.id }, relations: ['claimedBy'] });
      if (!updatedPart) throw new NotFoundException('Part not found after claim');
      return updatedPart;
    });
  }

  async returnPart(id: string, authUserId: string, userEmail: string, reason?: string): Promise<Part> {
    const [part, user] = await Promise.all([
      this.partRepo.findOne({ where: { id }, relations: ['claimedBy'] }),
      this.userRepo.findOne({ where: { id: authUserId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!part) throw new NotFoundException('Part not found');
    if (!part.claimedById) throw new BadRequestException('Part is not claimed');
    if (part.claimedById !== user.id) throw new ForbiddenException('You did not claim this part');

    return this.dataSource.transaction(async (manager) => {
      const partForUpdate = await manager.findOne(Part, { where: { id: part.id } });
      if (!partForUpdate) throw new NotFoundException('Part not found during transaction');

      partForUpdate.claimedById = null;
      partForUpdate.claimedBy = null;
      partForUpdate.claimedAt = null;
      partForUpdate.collected = false;
      partForUpdate.collectedAt = null;
      partForUpdate.status = PartStatus.AVAILABLE;
      partForUpdate.quantity += 1;

      await manager.save(partForUpdate);

      const txData: DeepPartial<PartTransaction> = {
        part: partForUpdate,
        user,
        type: TransactionType.RETURN,
        quantityDelta: 1,
        details: `Returned by ${userEmail}${reason ? `: ${reason}` : ''}`,
      };
      const tx = manager.create(PartTransaction, txData);
      await manager.save(tx);

      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.GENERAL,
            message: `Part returned: ${partForUpdate.name} (${partForUpdate.partNumber}) by ${user.name}`,
            metadata: { partId: partForUpdate.id, reason: reason || 'No reason provided' },
          }),
        ),
      );

      const updatedPart = await manager.getRepository(Part).findOne({ where: { id: partForUpdate.id }, relations: ['claimedBy'] });
      if (!updatedPart) throw new NotFoundException('Part not found after return');
      return updatedPart;
    });
  }

  async collectPart(id: string, authUserId: string): Promise<Part> {
    const [part, user] = await Promise.all([
      this.partRepo.findOne({ where: { id }, relations: ['claimedBy'] }),
      this.userRepo.findOne({ where: { id: authUserId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!part) throw new NotFoundException('Part not found');
    if (!part.claimedById) throw new BadRequestException('Part must be claimed before collection');
    if (part.claimedById !== user.id) throw new ForbiddenException('You did not claim this part');
    if (part.collected) throw new BadRequestException('Part already collected');

    return this.dataSource.transaction(async (manager) => {
      const partForUpdate = await manager.findOne(Part, { where: { id: part.id } });
      if (!partForUpdate) throw new NotFoundException('Part not found during transaction');

      partForUpdate.collected = true;
      partForUpdate.collectedAt = new Date();
      partForUpdate.status = PartStatus.COLLECTED;

      await manager.save(partForUpdate);

      const txData: DeepPartial<PartTransaction> = {
        part: partForUpdate,
        user,
        type: TransactionType.COLLECT,
        quantityDelta: 0,
        details: `Collected by ${user.email}`,
      };
      const tx = manager.create(PartTransaction, txData);
      await manager.save(tx);

      const admins = await manager.getRepository(User).find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERVISOR }] });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create({
            userId: admin.id,
            type: NotificationType.PART_COLLECTED,
            message: `Part collected: ${partForUpdate.name} by ${user.name}`,
            metadata: { partId: partForUpdate.id, claimedAt: partForUpdate.claimedAt, collectedAt: partForUpdate.collectedAt, claimedByName: user.name },
          }),
        ),
      );

      const updatedPart = await manager.getRepository(Part).findOne({ where: { id: partForUpdate.id }, relations: ['claimedBy'] });
      if (!updatedPart) throw new NotFoundException('Part not found after collect');
      return updatedPart;
    });
  }
}
