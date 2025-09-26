import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartTransaction } from './part-transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Part } from '../parts/part.entity';
import { TonerTransaction } from './toner-transaction.entity';
import { Toner } from '../toners/toner.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartTransaction, TonerTransaction, Part, Toner, User])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
