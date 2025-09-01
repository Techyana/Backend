// src/users/users.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { MailService } from '../mail/mail.service';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Update a user's password securely.
   * Optionally verifies current password, checks confirmation,
   * hashes new password, and flips mustChangePassword to false.
   */
  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    console.log('🔐 updatePassword called for userId:', userId);

    // Guard missing userId
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Fetch user or 404
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${userId}`);
    }

    // Verify current password if provided
    if (dto.passwordCurrent) {
      const matches = await bcrypt.compare(
        dto.passwordCurrent,
        user.passwordHash,
      );
      if (!matches) {
        throw new ForbiddenException('Current password is incorrect');
      }
    }

    // Ensure new passwords match
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Ensure new password differs from old
    if (await bcrypt.compare(dto.password, user.passwordHash)) {
      throw new BadRequestException(
        'New password must differ from the current password',
      );
    }

    // Hash & update
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);
    const hashed = await bcrypt.hash(dto.password, saltRounds);

    await this.userRepo.update(userId, {
      passwordHash: hashed,
      mustChangePassword: false,
      updatedAt: new Date(),
    });

    // Send confirmation email (non-blocking)
    this.mailService
      .sendPasswordChangeConfirmation(user.email, user.name)
      .catch(() => {});

    return { message: 'Password updated successfully' };
  }

  /**
   * Validate a user's credentials for login.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  /**
   * Find a user by email or return null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /**
   * Find a user by ID.
   * Throws if no ID supplied or no user found.
   */
  async findById(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${id}`);
    }
    return user;
  }

  /**
   * Save a user entity.
   */
  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /**
   * List all users (admin-only).
   */
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
}
