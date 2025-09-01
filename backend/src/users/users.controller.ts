// src/users/users.controller.ts
import {
  Controller, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from './role.enum';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @Get()
  async list() {
    return this.users.findAll();
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard) // RolesGuard still applied at controller; ok since no @Roles() here
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: any,
  ) {
    if (req.user.id !== String(id)) {
      throw new ForbiddenException('You can only change your own password');
    }
    return this.users.updatePassword(id, updatePasswordDto);
  }
}
