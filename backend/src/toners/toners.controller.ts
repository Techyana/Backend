import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TonersService } from './toners.service';
import { CreateTonerDto } from './dto/create-toner.dto';
import { TonerResponseDto } from './dto/toner-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('toners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('toners')
export class TonersController {
  constructor(private readonly tonersService: TonersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new toner' })
  @ApiResponse({ status: 201, type: TonerResponseDto })
  async create(@Body() dto: CreateTonerDto): Promise<TonerResponseDto> {
    const toner = await this.tonersService.create(dto);
    return new TonerResponseDto(toner);
  }

  @Get()
  @ApiOperation({ summary: 'Get all toners' })
  @ApiResponse({ status: 200, type: [TonerResponseDto] })
  async findAll(): Promise<TonerResponseDto[]> {
    const toners = await this.tonersService.findAll();
    return toners.map(t => new TonerResponseDto(t));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a toner by ID' })
  @ApiResponse({ status: 200, type: TonerResponseDto })
  async findOne(@Param('id') id: string): Promise<TonerResponseDto> {
    const toner = await this.tonersService.findOne(id);
    return new TonerResponseDto(toner);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a toner by ID' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.tonersService.remove(id);
  }
}
