import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './notification.entity'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { UpdateNotificationDto } from './dto/update-notification.dto'
import { NotificationsGateway } from './notifications.gateway'
import { User } from '../users/user.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: createDto.userId } })
    if (!user) {
      throw new NotFoundException(`User ${createDto.userId} not found`)
    }

    const notification = this.notificationRepository.create({
      user,
      message: createDto.message,
      type: createDto.type,
      metadata: createDto.metadata,
      isRead: createDto.isRead ?? false,
    })
    const saved = await this.notificationRepository.save(notification)
    this.gateway.sendNotification(user.id, saved)
    return saved
  }

  async findAll(userId?: string): Promise<Notification[]> {
    if (userId) {
      return this.notificationRepository.find({
        where: { user: { id: userId } },
        order: { timestamp: 'DESC' },
      })
    }
    return this.notificationRepository.find({
      order: { timestamp: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } })
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`)
    }
    return notification
  }

  async update(id: string, updateDto: UpdateNotificationDto, isAdmin: boolean): Promise<Notification> {
    const notification = await this.findOne(id)
    // Users can only mark as read; admins can update all fields
    if (typeof updateDto.isRead !== 'undefined') notification.isRead = updateDto.isRead
    if (isAdmin) {
      if (typeof updateDto.message !== 'undefined') notification.message = updateDto.message
      if (typeof updateDto.type !== 'undefined') notification.type = updateDto.type
      if (typeof updateDto.metadata !== 'undefined') notification.metadata = updateDto.metadata
    } else {
      // Prevent non-admins from updating other fields
      if (
        typeof updateDto.message !== 'undefined' ||
        typeof updateDto.type !== 'undefined' ||
        typeof updateDto.metadata !== 'undefined'
      ) {
        throw new ForbiddenException('Only admins can update message, type, or metadata')
      }
    }
    const saved = await this.notificationRepository.save(notification)
    this.gateway.sendNotification(notification.user.id, saved)
    return saved
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id)
    await this.notificationRepository.remove(notification)
  }
}
