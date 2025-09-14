import { IsString, IsEmail, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../role.enum';

export class CreateUserDto {
  @ApiProperty({ type: 'string', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ type: 'string', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  surname: string;

  @ApiProperty({ type: 'string', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: 'string', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  rzaNumber: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ type: 'boolean', required: false })
  @IsOptional()
  mustChangePassword?: boolean;
}
