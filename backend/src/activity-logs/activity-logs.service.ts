import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepo: Repository<ActivityLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(userId?: string): Promise<ActivityLog[]> {
    const query = this.activityLogRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.timestamp', 'DESC');
    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<ActivityLog | null> {
    return this.activityLogRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new Error('User not found');
    const log = this.activityLogRepo.create({
      user,
      action: dto.action,
      details: dto.details,
    });
    return this.activityLogRepo.save(log);
  }
}
