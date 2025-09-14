import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DevicesController } from './devices.controller'
import { DevicesService } from './devices.service'
import { Device } from './device.entity'
import { StrippedPart } from '../stripped-parts/stripped-part.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, StrippedPart]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
