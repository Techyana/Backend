import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator'

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', required: false })
  @IsOptional()
  @IsString()
  passwordCurrent?: string

  @ApiProperty({
    example: 'NewPassword456!',
    minLength: 8,
    maxLength: 32,
    description: 'Must include uppercase, lowercase, number, and special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be no longer than 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password: string

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  passwordConfirm: string
}
