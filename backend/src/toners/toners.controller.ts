// src/toners/toners.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { TonersService } from './toners.service'
import { CreateTonerDto } from './dto/create-toner.dto'
import { TonerResponseDto } from './dto/toner-response.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'

@ApiTags('toners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('toners')
export class TonersController {
  constructor(private readonly tonersService: TonersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new toner' })
  @ApiResponse({ status: 201, type: TonerResponseDto })
  async create(
    @Body() dto: CreateTonerDto,
  ): Promise<TonerResponseDto> {
    const toner = await this.tonersService.create(dto)

    // map entity → DTO manually
    const response = new TonerResponseDto()
    response.id = toner.id
    response.model = toner.model
    response.edpCode = toner.edpCode
    response.color = toner.color
    response.yield = toner.yield
    response.stock = toner.stock
    response.forDeviceModels = toner.forDeviceModels
    response.createdAtTimestamp = toner.createdAtTimestamp
    response.updatedAtTimestamp = toner.updatedAtTimestamp

    return response
  }

  @Get()
  @ApiOperation({ summary: 'Get all toners' })
  @ApiResponse({ status: 200, type: [TonerResponseDto] })
  async findAll(): Promise<TonerResponseDto[]> {
    const toners = await this.tonersService.findAll()

    return toners.map((toner) => {
      const dto = new TonerResponseDto()
      dto.id = toner.id
      dto.model = toner.model
      dto.edpCode = toner.edpCode
      dto.color = toner.color
      dto.yield = toner.yield
      dto.stock = toner.stock
      dto.forDeviceModels = toner.forDeviceModels
      dto.createdAtTimestamp = toner.createdAtTimestamp
      dto.updatedAtTimestamp = toner.updatedAtTimestamp
      return dto
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a toner by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Toner UUID' })
  @ApiResponse({ status: 200, type: TonerResponseDto })
  async findOne(
    @Param('id') id: string,
  ): Promise<TonerResponseDto> {
    const toner = await this.tonersService.findOne(id)

    const dto = new TonerResponseDto()
    dto.id = toner.id
    dto.model = toner.model
    dto.edpCode = toner.edpCode
    dto.color = toner.color
    dto.yield = toner.yield
    dto.stock = toner.stock
    dto.forDeviceModels = toner.forDeviceModels
    dto.createdAtTimestamp = toner.createdAtTimestamp
    dto.updatedAtTimestamp = toner.updatedAtTimestamp
    return dto
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a toner by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Toner UUID' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.tonersService.remove(id)
  }
}
