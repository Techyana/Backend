import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrippedPart } from './stripped-part.entity';
import { StrippedPartsService } from './stripped-parts.service';
import { StrippedPartsController } from './stripped-parts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StrippedPart])],
  providers: [StrippedPartsService],
  controllers: [StrippedPartsController],
  exports: [StrippedPartsService],
})
export class StrippedPartsModule {}
