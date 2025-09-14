import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../role.enum';

export class UserResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string' })
  name: string;

  @ApiProperty({ type: 'string' })
  surname: string;

  @ApiProperty({ type: 'string', format: 'email' })
  email: string;

  @ApiProperty({ type: 'string' })
  rzaNumber: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ type: 'boolean', required: false })
  mustChangePassword?: boolean;
}
