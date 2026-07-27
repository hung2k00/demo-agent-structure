import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSupplierDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.supplier.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Mã nhà cung cấp '${code}' đã tồn tại trong hệ thống`);
    }

    return this.prisma.supplier.create({
      data: {
        code,
        name: dto.name.trim(),
        email: dto.email ? dto.email.trim().toLowerCase() : undefined,
        phone: dto.phone ? dto.phone.trim() : undefined,
        address: dto.address ? dto.address.trim() : undefined,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException('Không tìm thấy thông tin nhà cung cấp');
    }

    return supplier;
  }

  async update(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(tenantId, id);

    let code: string | undefined;
    if (dto.code) {
      code = dto.code.trim().toUpperCase();
      const existing = await this.prisma.supplier.findFirst({
        where: {
          tenantId,
          code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Mã nhà cung cấp '${code}' đã trùng lặp`);
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.email !== undefined && { email: dto.email ? dto.email.trim().toLowerCase() : null }),
        ...(dto.phone !== undefined && { phone: dto.phone ? dto.phone.trim() : null }),
        ...(dto.address !== undefined && { address: dto.address ? dto.address.trim() : null }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
