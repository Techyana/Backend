import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Toner } from './toner.entity';
import { CreateTonerDto } from './dto/create-toner.dto';

@Injectable()
export class TonersService {
  constructor(
    @InjectRepository(Toner)
    private readonly tonerRepo: Repository<Toner>,
  ) {}

  async create(dto: CreateTonerDto): Promise<Toner> {
    const toner = this.tonerRepo.create(dto);
    return await this.tonerRepo.save(toner);
  }

  async findAll(): Promise<Toner[]> {
    return await this.tonerRepo.find();
  }

  async findOne(id: string): Promise<Toner> {
    const toner = await this.tonerRepo.findOne({ where: { id } });
    if (!toner) {
      throw new NotFoundException(`Toner with id ${id} not found`);
    }
    return toner;
  }

  async remove(id: string): Promise<void> {
    const toner = await this.findOne(id);
    await this.tonerRepo.remove(toner);
  }
}
