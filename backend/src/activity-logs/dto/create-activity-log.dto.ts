import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityLogDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'User ID who performed the action' })
  @IsUUID()
  userId: string;

  @ApiProperty({ type: 'string', maxLength: 100, description: 'Action performed' })
  @IsString()
  @MaxLength(100)
  action: string;

  @ApiProperty({ type: 'string', required: false, description: 'Additional details about the action' })
  @IsOptional()
  @IsString()
  details?: string;
}
