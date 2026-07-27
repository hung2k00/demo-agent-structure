import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInTenant(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async updateRole(tenantId: string, targetUserId: string, newRole: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id: targetUserId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng trong hệ thống');
    }

    if (!Object.values(UserRole).includes(newRole)) {
      throw new BadRequestException('Vai trò mới không hợp lệ');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
