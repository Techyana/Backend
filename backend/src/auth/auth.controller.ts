import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthUserPayload } from './types/auth-user-payload.type';
import { UsersService } from '../users/users.service';

interface RequestWithUser extends Request {
  user: AuthUserPayload;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<void> {
    const { access_token, user } = await this.authService.login(loginDto);

    res.cookie('jwt-session', access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.status(200).json({
      message: 'Login successful',
      user,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Req() requestWithUser: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; user: AuthUserPayload }> {
    // 1) Update password in DB
    await this.authService.updatePassword(
      requestWithUser.user.id,
      updatePasswordDto,
    );

    // 2) Re-fetch the updated user
    const updatedUser = await this.usersService.findById(
      requestWithUser.user.id,
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found after password change');
    }

    // 3) Build the AuthUserPayload (now including isActive)
    const payload: AuthUserPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mustChangePassword: updatedUser.mustChangePassword,
      isActive: updatedUser.isActive,
    };

    // 4) Issue fresh JWT & reset cookie
    const access_token = await this.authService.generateAccessToken(payload);
    res.cookie('jwt-session', access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1h
    });

    // 5) Return to client
    return {
      message: 'Password updated successfully',
      user: payload,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: Response): void {
    res.clearCookie('jwt-session');
    res.send({ message: 'Logged out' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser, @Res() res: Response): void {
    res.json(req.user);
  }
}
