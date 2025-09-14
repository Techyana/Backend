import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';

export class ActivityLogResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: 'string', maxLength: 100 })
  action: string;

  @ApiProperty({ type: 'string', required: false })
  details?: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  timestamp: Date;
}
