import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Toner } from './toner.entity';
import { TonersService } from './toners.service';
import { TonersController } from './toners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Toner])],
  providers: [TonersService],
  controllers: [TonersController],
  exports: [TonersService],
})
export class TonersModule {}
