import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { UsersService } from '../users/users.service'
import { MailService } from '../mail/mail.service'

import { LoginDto } from './dto/login.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import type { AuthUserPayload } from './types/auth-user-payload.type'
import { User } from '../users/user.entity'

export interface LoginResponse {
  access_token: string
  user: AuthUserPayload
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
   * Generate JWT access token with custom claims.
   */
  async generateAccessToken(payload: AuthUserPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('Missing JWT_SECRET in configuration')
    }

    const expiresIn =
      this.configService.get<string | number>('JWT_EXPIRES_IN') ?? '1h'

    // Split out `id` into the official "sub" claim
    const { id, email, role, mustChangePassword, isActive } = payload

    return this.jwtService.signAsync(
      { email, role, mustChangePassword, isActive },
      {
        secret,
        expiresIn,
        subject: id,
      },
    )
  }

  /**
   * Validate credentials, fire welcome mail, return token + safe user DTO.
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { email, password } = dto
    const user = await this.usersService.validateUser(email, password)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive')
    }

    // Fire-and-forget welcome email (only on first login)
    if (user.mustChangePassword) {
      this.mailService.sendWelcomeEmail(user.email, user.name).catch(() => {})
    }

    const payload: AuthUserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
    }

    const access_token = await this.generateAccessToken(payload)
    return { access_token, user: payload }
  }

  /**
   * Change password flow for logged-in users.
   * Skips requiring `passwordCurrent` on forced first login.
   */
  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<User> {
    const { passwordCurrent, password, passwordConfirm } = dto

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match')
    }

    // 1) Load user
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // 2) If not first login, verify current password
    if (!user.mustChangePassword) {
      if (!passwordCurrent) {
        throw new BadRequestException('Current password is required')
      }
      const valid = await bcrypt.compare(passwordCurrent, user.passwordHash)
      if (!valid) {
        throw new BadRequestException('Current password is incorrect')
      }
      // Prevent reusing the same password
      if (await bcrypt.compare(password, user.passwordHash)) {
        throw new BadRequestException(
          'New password must be different from the old one',
        )
      }
    }

    // 3) Hash & flip the flag
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 10,
    )
    user.passwordHash = await bcrypt.hash(password, saltRounds)
    user.mustChangePassword = false

    // 4) Persist both columns in one go
    const savedUser = await this.usersService.save(user)

    // 5) Fire confirmation mail
    this.mailService
      .sendPasswordChangeConfirmation(savedUser.email, savedUser.name)
      .catch(() => {})

    return savedUser
  }
}
