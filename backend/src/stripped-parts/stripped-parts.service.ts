import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StrippedPart } from './stripped-part.entity';
import { CreateStrippedPartDto } from './dto/create-stripped-part.dto';

@Injectable()
export class StrippedPartsService {
  constructor(
    @InjectRepository(StrippedPart)
    private readonly strippedPartRepo: Repository<StrippedPart>,
  ) {}

  async create(dto: CreateStrippedPartDto): Promise<StrippedPart> {
    const strippedPart = this.strippedPartRepo.create(dto);
    return await this.strippedPartRepo.save(strippedPart);
  }

  async findAll(): Promise<StrippedPart[]> {
    return await this.strippedPartRepo.find({ relations: ['part', 'device'] });
  }

  async findOne(id: string): Promise<StrippedPart> {
    const strippedPart = await this.strippedPartRepo.findOne({
      where: { id },
      relations: ['part', 'device'],
    });
    if (!strippedPart) {
      throw new NotFoundException(`Stripped part with id ${id} not found`);
    }
    return strippedPart;
  }

  async remove(id: string): Promise<void> {
    const strippedPart = await this.findOne(id);
    await this.strippedPartRepo.remove(strippedPart);
  }
}
