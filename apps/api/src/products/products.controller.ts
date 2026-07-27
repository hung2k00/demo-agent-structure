import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async create(@Request() req, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(req.user.tenantId, search, category, categoryId);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findLowStock(@Request() req) {
    return this.productsService.findLowStock(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.productsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return this.productsService.remove(req.user.tenantId, id);
  }
}
