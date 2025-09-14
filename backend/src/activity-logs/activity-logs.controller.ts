import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async findAll(@Query('userId') userId?: string) {
    return this.activityLogsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityLogsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateActivityLogDto) {
    return this.activityLogsService.create(dto);
  }
}
