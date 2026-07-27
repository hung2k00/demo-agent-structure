import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    const existingCode = await this.prisma.category.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
    });
    if (existingCode) {
      throw new ConflictException(`Mã danh mục '${code}' đã tồn tại trong kho hàng của bạn`);
    }

    const existingName = await this.prisma.category.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
    });
    if (existingName) {
      throw new ConflictException(`Tên danh mục '${name}' đã tồn tại trong kho hàng của bạn`);
    }

    return this.prisma.category.create({
      data: {
        code,
        name,
        description: dto.description ? dto.description.trim() : undefined,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(tenantId, id);

    let code: string | undefined;
    if (dto.code) {
      code = dto.code.trim().toUpperCase();
      const existing = await this.prisma.category.findFirst({
        where: {
          tenantId,
          code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Mã danh mục '${code}' đã bị trùng lặp`);
      }
    }

    let name: string | undefined;
    if (dto.name) {
      name = dto.name.trim();
      const existing = await this.prisma.category.findFirst({
        where: {
          tenantId,
          name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Tên danh mục '${name}' đã bị trùng lặp`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(dto.description !== undefined && { description: dto.description ? dto.description.trim() : null }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
