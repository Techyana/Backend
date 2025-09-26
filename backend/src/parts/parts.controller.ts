import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Header,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import { PartStatus } from './part-status.enum';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartResponseDto } from './dto/part-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

const SWAGGER_BEARER = process.env.SWAGGER_BEARER_NAME || 'access-token';

@ApiBearerAuth(SWAGGER_BEARER)
@ApiTags('Parts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('parts')
export class PartsController {
  private readonly logger = new Logger(PartsController.name);

  constructor(private readonly partsService: PartsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Create a new part' })
  @ApiBody({ type: CreatePartDto })
  @ApiResponse({ status: 201, description: 'Part created', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreatePartDto): Promise<PartResponseDto> {
    const part = await this.partsService.create(dto);
    return new PartResponseDto(part);
  }

  @Get()
  @Header('Cache-Control', 'no-store, max-age=0')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.ENGINEER)
  @ApiOperation({ summary: 'Retrieve all parts' })
  @ApiResponse({ status: 200, description: 'Array of parts', type: [PartResponseDto] })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  async findAll(@Request() req: any): Promise<PartResponseDto[]> {
    const parts =
      req.user.role === Role.ENGINEER
        ? await this.partsService.findByStatus(PartStatus.AVAILABLE)
        : await this.partsService.findAll();

    return parts.map((p) => new PartResponseDto(p));
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.ENGINEER)
  @ApiOperation({ summary: 'Retrieve a part by its UUID' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiResponse({ status: 200, description: 'Part found', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Invalid UUID' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<PartResponseDto> {
    const part = await this.partsService.findOne(id);
    return new PartResponseDto(part);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a part by its UUID' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiBody({ type: UpdatePartDto })
  @ApiResponse({ status: 200, description: 'Part updated', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePartDto,
  ): Promise<PartResponseDto> {
    const part = await this.partsService.update(id, dto);
    return new PartResponseDto(part);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a part by its UUID, with reason' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for deletion' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Part deleted' })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ): Promise<void> {
    await this.partsService.removeWithReason(id, req.user.sub, req.user.email, reason);
  }

  @Post(':id/claim')
  @Roles(Role.ENGINEER)
  @ApiTags('Parts', 'Claims')
  @ApiOperation({ summary: 'Claim a part for the current user' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiResponse({ status: 200, description: 'Part claimed', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async claimPart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<PartResponseDto> {
    const authUserId: string = req.user?.sub ?? req.user?.id;
    if (!authUserId) {
      this.logger.error('Authenticated user missing on claim request', req.user);
      throw new Error('Authenticated user not found');
    }
    this.logger.log(`Claim request user=${authUserId} part=${id}`);
    const part = await this.partsService.claimPart(id, authUserId);
    return new PartResponseDto(part);
  }

  @Post(':id/request')
  @Roles(Role.ENGINEER)
  @ApiTags('Parts', 'Requests')
  @ApiOperation({ summary: 'Request a part for the current user' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiResponse({ status: 200, description: 'Part requested', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async requestPart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<PartResponseDto> {
    const authUserId: string = req.user?.sub ?? req.user?.id;
    this.logger.log(`Request part user=${authUserId} part=${id}`);
    const part = await this.partsService.requestPart(id, authUserId);
    return new PartResponseDto(part);
  }

  @Post(':id/return')
  @Roles(Role.ENGINEER)
  @ApiTags('Parts', 'Returns')
  @ApiOperation({ summary: 'Return a claimed part for the current user' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for return' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Part returned', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async returnPart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ): Promise<PartResponseDto> {
    const authUserId: string = req.user?.sub ?? req.user?.id;
    this.logger.log(`Return part user=${authUserId} part=${id} reason=${reason}`);
    const part = await this.partsService.returnPart(id, authUserId, req.user.email, reason);
    return new PartResponseDto(part);
  }

  @Post(':id/collect')
  @Roles(Role.ENGINEER)
  @ApiTags('Parts', 'Collections')
  @ApiOperation({ summary: 'Mark a claimed part as collected' })
  @ApiParam({ name: 'id', type: String, description: 'Part UUID' })
  @ApiResponse({ status: 200, description: 'Part collected', type: PartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Validation error' })
  @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Forbidden' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Part not found' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async collectPart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<PartResponseDto> {
    const authUserId: string = req.user?.sub ?? req.user?.id;
    this.logger.log(`Collect part user=${authUserId} part=${id}`);
    const part = await this.partsService.collectPart(id, authUserId);
    return new PartResponseDto(part);
  }
}
