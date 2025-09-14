import { IsString, IsEmail, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ type: 'string', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ type: 'string', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  surname?: string;

  @ApiPropertyOptional({ type: 'string', format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: 'string', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  rzaNumber?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ type: 'boolean' })
  @IsOptional()
  mustChangePassword?: boolean;
}
