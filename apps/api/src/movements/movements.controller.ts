import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementStatusDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, MovementType, MovementStatus } from '@prisma/client';

@Controller('movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async create(@Request() req, @Body() dto: CreateMovementDto) {
    return this.movementsService.create(req.user.tenantId, req.user.id, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findAll(@Request() req, @Query('type') type?: MovementType, @Query('status') status?: MovementStatus) {
    return this.movementsService.findAll(req.user.tenantId, type, status);
  }

  @Get('logs/history')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async getStockLogs(@Request() req) {
    return this.movementsService.getStockLogs(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.movementsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async updateStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateMovementStatusDto) {
    return this.movementsService.updateStatus(req.user.tenantId, id, dto);
  }
}
