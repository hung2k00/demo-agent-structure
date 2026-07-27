import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const sku = dto.sku.trim().toUpperCase();

    const existing = await this.prisma.product.findUnique({
      where: {
        tenantId_sku: {
          tenantId,
          sku,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Mã SKU '${sku}' đã tồn tại trong kho hàng của bạn`);
    }

    const product = await this.prisma.product.create({
      data: {
        sku,
        name: dto.name.trim(),
        category: dto.category.trim(),
        unit: dto.unit.trim(),
        minQuantity: dto.minQuantity ?? 5,
        price: dto.price,
        description: dto.description ? dto.description.trim() : undefined,
        quantity: 0,
        tenantId,
      },
    });

    return {
      ...product,
      isLowStock: product.quantity <= product.minQuantity,
    };
  }

  async findAll(tenantId: string, search?: string, category?: string) {
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      ...p,
      isLowStock: p.quantity <= p.minQuantity,
    }));
  }

  async findLowStock(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { quantity: 'asc' },
    });

    return products
      .filter((p) => p.quantity <= p.minQuantity)
      .map((p) => ({
        ...p,
        isLowStock: true,
      }));
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return {
      ...product,
      isLowStock: product.quantity <= product.minQuantity,
    };
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);

    let sku: string | undefined;
    if (dto.sku) {
      sku = dto.sku.trim().toUpperCase();
      const existing = await this.prisma.product.findFirst({
        where: {
          tenantId,
          sku,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Mã SKU '${sku}' đã bị trùng lặp`);
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(sku && { sku }),
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.category && { category: dto.category.trim() }),
        ...(dto.unit && { unit: dto.unit.trim() }),
        ...(dto.minQuantity !== undefined && { minQuantity: dto.minQuantity }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.description !== undefined && { description: dto.description ? dto.description.trim() : null }),
      },
    });

    return {
      ...product,
      isLowStock: product.quantity <= product.minQuantity,
    };
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
