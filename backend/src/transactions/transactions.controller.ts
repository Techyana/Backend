// src/transactions/transactions.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { TransactionResponseDto } from './dto/transaction-response.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new part transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const tx = await this.transactionsService.create(dto)
    return new TransactionResponseDto(tx)
  }

  @Get()
  @ApiOperation({ summary: 'Get all part transactions' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async findAll(): Promise<TransactionResponseDto[]> {
    const txs = await this.transactionsService.findAll()
    return txs.map(t => new TransactionResponseDto(t))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part transaction by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Transaction UUID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    const tx = await this.transactionsService.findOne(id)
    return new TransactionResponseDto(tx)
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions by hours' })
  @ApiQuery({ name: 'hours', type: Number, example: 24 })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecent(
    @Query('hours', ParseIntPipe) hours: number,
  ): Promise<TransactionResponseDto[]> {
    const txs = await this.transactionsService.getRecent(hours)
    return txs.map(t => new TransactionResponseDto(t))
  }

  @Get('collected')
  @ApiOperation({ summary: 'Get recent collected transactions by hours' })
  @ApiQuery({ name: 'hours', type: Number, example: 24 })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecentCollections(
    @Query('hours', ParseIntPipe) hours: number,
  ): Promise<TransactionResponseDto[]> {
    const txs = await this.transactionsService.getRecentCollections(hours)
    return txs.map(t => new TransactionResponseDto(t))
  }
}
