import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../users/role.enum'
import { NotificationService } from './notifications.service'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { UpdateNotificationDto } from './dto/update-notification.dto'
import { NotificationResponseDto } from './dto/notification-response.dto'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user (admin sees all)' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async findAll(@Request() req) {
    const userId = req.user.sub
    const isAdmin = req.user.role === Role.ADMIN
    const notifs = isAdmin
      ? await this.notificationService.findAll()
      : await this.notificationService.findAll(userId)

    return notifs.map((n) => new NotificationResponseDto(n))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one notification by ID' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async findOne(@Param('id') id: string) {
    const n = await this.notificationService.findOne(id)
    return new NotificationResponseDto(n)
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: create a notification' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  async create(@Body() dto: CreateNotificationDto) {
    const n = await this.notificationService.create(dto)
    return new NotificationResponseDto(n)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: update a notification' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    const n = await this.notificationService.update(id, dto)
    return new NotificationResponseDto(n)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Admin: delete a notification' })
  async remove(@Param('id') id: string) {
    await this.notificationService.remove(id)
  }
}
