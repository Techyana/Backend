import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TonersService } from './toners.service';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';

@Controller('toners')
export class TonersController {
  constructor(private readonly tonersService: TonersService) {}

  @Post()
  async create(@Body() createTonerDto: CreateTonerDto) {
    return this.tonersService.create(createTonerDto);
  }

  @Get()
  async findAll() {
    return this.tonersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tonersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTonerDto: UpdateTonerDto) {
    return this.tonersService.update(id, updateTonerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tonersService.remove(id);
    return { deleted: true };
  }

  @Patch(':id/claim')
  async claimToner(
    @Param('id') id: string,
    @Body('claimedBy') claimedBy: string,
    @Body('clientName') clientName: string,
    @Body('serialNumber') serialNumber: string,
  ) {
    return this.tonersService.claimToner(id, claimedBy, clientName, serialNumber);
  }

  @Patch(':id/collect')
  async collectToner(
    @Param('id') id: string,
    @Body('collectedBy') collectedBy: string,
  ) {
    return this.tonersService.collectToner(id, collectedBy);
  }
}
