import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StrippedPartsService } from './stripped-parts.service';
import { CreateStrippedPartDto } from './dto/create-stripped-part.dto';
import { StrippedPart } from './stripped-part.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('stripped-parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stripped-parts')
export class StrippedPartsController {
  constructor(private readonly strippedPartsService: StrippedPartsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a stripped part' })
  @ApiResponse({ status: 201, type: StrippedPart })
  async create(@Body() dto: CreateStrippedPartDto): Promise<StrippedPart> {
    return await this.strippedPartsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stripped parts' })
  @ApiResponse({ status: 200, type: [StrippedPart] })
  async findAll(): Promise<StrippedPart[]> {
    return await this.strippedPartsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stripped part by ID' })
  @ApiResponse({ status: 200, type: StrippedPart })
  async findOne(@Param('id') id: string): Promise<StrippedPart> {
    return await this.strippedPartsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stripped part by ID' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.strippedPartsService.remove(id);
  }
}
