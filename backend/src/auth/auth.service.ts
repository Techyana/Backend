// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { AuthUserPayload } from './types/auth-user-payload.type';
import { User } from '../users/user.entity';

export interface LoginResponse {
  access_token: string;
  user: AuthUserPayload;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Central JWT creation, sealed with your module’s secret & expiry.
   */
  async generateAccessToken(payload: AuthUserPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Missing JWT_SECRET in configuration');
    }

    // Optionally pull in an expiration setting, or remove if configured at module-level
    const expiresIn =
      this.configService.get<string | number>('JWT_EXPIRES_IN') ?? '1h';

    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  /**
   * Validate user credentials, fire off welcome mail, return token + user DTO.
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { email, password } = dto;
    const user = await this.usersService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    // Fire-and-forget welcome email
    this.mailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    const payload: AuthUserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const access_token = await this.generateAccessToken(payload);
    return { access_token, user: payload };
  }

  /**
   * Change password flow for logged-in users.
   */
  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<User> {
    const { passwordCurrent, password, passwordConfirm } = dto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // 1) Load the user
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2) Ensure we actually got a current password
    if (!passwordCurrent) {
      throw new BadRequestException('Current password is required');
    }

    // 3) Verify current password
    const isCurrentValid = await bcrypt.compare(
      passwordCurrent,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // 4) Ensure new password differs from old
    if (await bcrypt.compare(password, user.passwordHash)) {
      throw new BadRequestException(
        'New password must be different from the old one',
      );
    }

    // 5) Hash & persist
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 10,
    );
    user.passwordHash = await bcrypt.hash(password, saltRounds);
    user.mustChangePassword = false;
    const savedUser = await this.usersService.save(user);

    // 6) Fire-and-forget confirmation email
    this.mailService
      .sendPasswordChangeConfirmation(savedUser.email, savedUser.name)
      .catch(() => {});

    return savedUser;
  }
}
