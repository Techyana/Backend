import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Device } from './device.entity'
import { DeviceStatus } from './device-status.enum'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepo.find({ relations: ['strippedParts'] })
  }

  async findById(id: string): Promise<Device | null> {
    return this.deviceRepo.findOne({
      where: { id },
      relations: ['strippedParts'],
    })
  }

  async create(dto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepo.create(dto)
    return this.deviceRepo.save(device)
  }

  async update(id: string, dto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findById(id)
    if (!device) throw new NotFoundException('Device not found')
    Object.assign(device, dto)
    return this.deviceRepo.save(device)
  }

  async remove(id: string, reason?: string): Promise<Device> {
    const device = await this.findById(id)
    if (!device) throw new NotFoundException('Device not found')
    device.status = DeviceStatus.REMOVED
    if (reason) device.removalReason = reason
    return this.deviceRepo.save(device)
  }
}
