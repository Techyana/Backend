// src/parts/parts.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Part } from '../entities/part.entity';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Part]),  // register the Part entity
  ],
  providers: [PartsService],
  controllers: [PartsController],
  exports: [PartsService],             // if other modules need PartsService
})
export class PartsModule {}
