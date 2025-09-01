// src/auth/dto/update-password.dto.ts
import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  passwordCurrent?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be no longer than 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  passwordConfirm: string;
}
