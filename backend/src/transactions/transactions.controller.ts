import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto, RecentTransactionsQueryDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TransactionType } from './transaction-type.enum';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new transaction (part or toner)' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(@Body() body: CreateTransactionDto): Promise<TransactionResponseDto> {
    this.logger.log('Creating new transaction', JSON.stringify(body));
    const tx = await this.transactionsService.create(body);
    return new TransactionResponseDto(tx);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions (part and toner)' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async findAll(): Promise<TransactionResponseDto[]> {
    this.logger.log('Fetching all transactions');
    const txs = await this.transactionsService.findAll();
    return txs.map((t) => new TransactionResponseDto(t));
  }

  @Get('recent')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get recent transactions by hours and types' })
  @ApiQuery({ name: 'hours', type: Number, required: false, example: 12 })
  @ApiQuery({ name: 'types', type: String, required: false, description: 'Comma-separated transaction types (e.g. claim,collect,request)' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecent(@Query() query: RecentTransactionsQueryDto): Promise<TransactionResponseDto[]> {
    this.logger.log(`Fetching recent transactions with filters`, JSON.stringify(query));
    let typeArr: TransactionType[] | undefined = undefined;
    if (query.types) {
      typeArr = query.types
        .split(',')
        .map((t: string) => t.trim().toUpperCase())
        .filter((t: string) => Object.values(TransactionType).includes(t as TransactionType))
        .map((t: string) => t as TransactionType);
    }
    const txs = await this.transactionsService.findRecent(query.hours ?? 12, typeArr);
    return Array.isArray(txs) ? txs.map((t) => new TransactionResponseDto(t)) : [];
  }

  @Get('collected')
  @ApiOperation({ summary: 'Get recent collected transactions by hours' })
  @ApiQuery({ name: 'hours', type: Number, required: false, example: 12 })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getRecentCollections(@Query('hours', ParseIntPipe) hours = 12): Promise<TransactionResponseDto[]> {
    this.logger.log('Fetching recent collected transactions');
    const txs = await this.transactionsService.getRecentCollections(hours);
    return Array.isArray(txs) ? txs.map((t) => new TransactionResponseDto(t)) : [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID (part or toner)' })
  @ApiParam({ name: 'id', type: String, description: 'Transaction UUID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    this.logger.log(`Fetching transaction by id: ${id}`);
    const tx = await this.transactionsService.findOne(id);
    if (!tx) {
      this.logger.warn(`Transaction not found: ${id}`);
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return new TransactionResponseDto(tx);
  }
}
