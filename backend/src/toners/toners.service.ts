import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Toner } from './toner.entity';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';

@Injectable()
export class TonersService {
  constructor(
    @InjectRepository(Toner)
    private readonly tonerRepository: Repository<Toner>,
  ) {}

  async create(createTonerDto: CreateTonerDto): Promise<Toner> {
    const toner = this.tonerRepository.create(createTonerDto);
    return this.tonerRepository.save(toner);
  }

  async findAll(): Promise<Toner[]> {
    return this.tonerRepository.find();
  }

  async findOne(id: string): Promise<Toner> {
    const toner = await this.tonerRepository.findOne({ where: { id } });
    if (!toner) throw new NotFoundException('Toner not found');
    return toner;
  }

  async update(id: string, updateTonerDto: UpdateTonerDto): Promise<Toner> {
    const toner = await this.findOne(id);
    Object.assign(toner, updateTonerDto);
    return this.tonerRepository.save(toner);
  }

  async remove(id: string): Promise<void> {
    await this.tonerRepository.delete(id);
  }

  async claimToner(
    id: string,
    claimedBy: string,
    clientName: string,
    serialNumber: string,
  ): Promise<Toner> {
    const toner = await this.findOne(id);
    toner.claimedBy = claimedBy;
    toner.claimedAt = new Date();
    toner.clientName = clientName;
    toner.serialNumber = serialNumber;
    return this.tonerRepository.save(toner);
  }

  async collectToner(id: string, collectedBy: string): Promise<Toner> {
    const toner = await this.findOne(id);
    toner.collectedBy = collectedBy;
    toner.collectedAt = new Date();
    return this.tonerRepository.save(toner);
  }
}
