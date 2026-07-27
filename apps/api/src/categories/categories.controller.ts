import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async create(@Request() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER, UserRole.STAFF)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.categoriesService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.tenantId, id);
  }
}
