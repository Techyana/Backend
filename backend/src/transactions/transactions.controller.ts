import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new part transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(dto);
    return new TransactionResponseDto(transaction);
  }

  @Get()
  @ApiOperation({ summary: 'Get all part transactions' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async findAll(): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionsService.findAll();
    return transactions.map(t => new TransactionResponseDto(t));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part transaction by ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.findOne(id);
    return new TransactionResponseDto(transaction);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions by hours' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecent(@Query('hours') hours: number): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionsService.getRecent(hours);
    return transactions.map(t => new TransactionResponseDto(t));
  }

  @Get('collected')
  @ApiOperation({ summary: 'Get recent collected transactions by hours' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecentCollections(@Query('hours') hours: number): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionsService.getRecentCollections(hours);
    return transactions.map(t => new TransactionResponseDto(t));
  }
}
