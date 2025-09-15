// src/parts/parts.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Part } from './part.entity';
import { PartTransaction } from '../transactions/part-transaction.entity'
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Part, PartTransaction]),
  ],
  providers: [PartsService],
  controllers: [PartsController],
  exports: [PartsService],
})
export class PartsModule {}
