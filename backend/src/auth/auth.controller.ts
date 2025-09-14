import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  NotFoundException,
  HttpCode,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt.guard'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { LoginDto } from './dto/login.dto'
import type { AuthUserPayload } from './types/auth-user-payload.type'
import { UsersService } from '../users/users.service'

interface RequestWithUser extends Request {
  user: AuthUserPayload
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Login and receive JWT session cookie' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<void> {
    const { access_token, user } = await this.authService.login(loginDto)

    res.cookie('jwt-session', access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1h
    })

    res.status(200).json({
      message: 'Login successful',
      user,
    })
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update password for logged-in user' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Req() requestWithUser: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; user: AuthUserPayload }> {
    await this.authService.updatePassword(
      requestWithUser.user.id,
      updatePasswordDto,
    )

    const updatedUser = await this.usersService.findById(
      requestWithUser.user.id,
    )
    if (!updatedUser) {
      throw new NotFoundException('User not found after password change')
    }

    const payload: AuthUserPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mustChangePassword: updatedUser.mustChangePassword,
      isActive: updatedUser.isActive,
    }

    const access_token = await this.authService.generateAccessToken(payload)
    res.cookie('jwt-session', access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1h
    })

    return {
      message: 'Password updated successfully',
      user: payload,
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and clear JWT session cookie' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout(@Res() res: Response): void {
    res.clearCookie('jwt-session')
    res.send({ message: 'Logged out' })
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser, @Res() res: Response): void {
    res.json(req.user)
  }
}
