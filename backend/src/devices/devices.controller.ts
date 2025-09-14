import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { DevicesService } from './devices.service'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'
import { Device } from './device.entity'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../users/role.enum'

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, type: [Device] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(): Promise<Device[]> {
    return this.devicesService.findAll()
  }

  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, type: Device })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<Device> {
    const device = await this.devicesService.findById(id)
    if (!device) throw new NotFoundException('Device not found')
    return device
  }

  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, type: Device })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @Post()
  async create(@Body() dto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(dto)
  }

  @ApiOperation({ summary: 'Update a device' })
  @ApiResponse({ status: 200, type: Device })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @Post(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeviceDto): Promise<Device> {
    return this.devicesService.update(id, dto)
  }

  @ApiOperation({ summary: 'Delete (remove) a device' })
  @ApiResponse({ status: 200, type: Device })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('reason') reason?: string): Promise<Device> {
    return this.devicesService.remove(id, reason)
  }
}
