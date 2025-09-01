// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { MailModule } from '../mail/mail.module'; // 👈 import here

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule, // 👈 now MailService is available
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
