// src/common/dto/error-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code of the error',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Short description of the error type',
  })
  error: string;

  @ApiProperty({
    example: ['username must be a string', 'password should not be empty'],
    description: 'Detailed error message(s); either a string or an array of strings',
    type: [String],
  })
  message: string | string[];

  @ApiProperty({
    example: '2025-09-08T09:30:00.000Z',
    description: 'Timestamp of when the error occurred',
  })
  timestamp: string;

  @ApiProperty({
    example: '/auth/login',
    description: 'Request path that triggered the error',
  })
  path: string;
}
