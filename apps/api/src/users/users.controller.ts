import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getUsers(@Request() req) {
    return this.usersService.findAllInTenant(req.user.tenantId);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(@Request() req, @Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(req.user.tenantId, id, role);
  }
}
