import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, UpdateMovementStatusDto } from './dto/create-movement.dto';
import { MovementType, MovementStatus } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateReceiptCode(type: MovementType): string {
    const prefix = type === MovementType.IMPORT ? 'PN' : 'PX';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${randomSuffix}`;
  }

  async create(tenantId: string, createdById: string, dto: CreateMovementDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Phiếu nhập/xuất phải chứa ít nhất 1 mặt hàng');
    }

    // Check products existence and stock availability for EXPORT
    let totalAmount = 0;
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm (ID: ${item.productId}) không tồn tại trong kho`);
      }

      if (dto.type === MovementType.EXPORT && product.quantity < item.quantity) {
        throw new BadRequestException(
          `INSUFFICIENT_STOCK: Sản phẩm '${product.name}' (SKU: ${product.sku}) hiện chỉ còn ${product.quantity} ${product.unit}, không đủ để xuất ${item.quantity} ${product.unit}`,
        );
      }

      totalAmount += item.quantity * item.price;
    }

    // Verify supplier if provided
    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: dto.supplierId, tenantId },
      });
      if (!supplier) {
        throw new NotFoundException('Nhà cung cấp không tồn tại');
      }
    }

    const code = this.generateReceiptCode(dto.type);

    const movement = await this.prisma.warehouseMovement.create({
      data: {
        code,
        type: dto.type,
        status: MovementStatus.PENDING,
        totalAmount,
        note: dto.note ? dto.note.trim() : undefined,
        supplierId: dto.supplierId || undefined,
        createdById,
        tenantId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        supplier: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return movement;
  }

  async findAll(tenantId: string, type?: MovementType, status?: MovementStatus) {
    const where: any = { tenantId };
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.warehouseMovement.findMany({
      where,
      include: {
        supplier: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const movement = await this.prisma.warehouseMovement.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        logs: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!movement) {
      throw new NotFoundException('Không tìm thấy thông tin phiếu nhập/xuất');
    }

    return movement;
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateMovementStatusDto) {
    const movement = await this.findOne(tenantId, id);

    if (movement.status === dto.status) {
      return movement;
    }

    if (movement.status === MovementStatus.COMPLETED || movement.status === MovementStatus.CANCELLED) {
      throw new BadRequestException(`Phiếu đã ở trạng thái ${movement.status}, không thể thay đổi nữa`);
    }

    // Handle COMPLETED status transition
    if (dto.status === MovementStatus.COMPLETED) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of movement.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm ${item.productId}`);
          }

          let newQuantity = product.quantity;
          let quantityChange = 0;

          if (movement.type === MovementType.IMPORT) {
            quantityChange = item.quantity;
            newQuantity = product.quantity + item.quantity;
          } else if (movement.type === MovementType.EXPORT) {
            if (product.quantity < item.quantity) {
              throw new BadRequestException(
                `INSUFFICIENT_STOCK: Sản phẩm '${product.name}' hiện chỉ còn ${product.quantity}, không đủ để duyệt xuất ${item.quantity}`,
              );
            }
            quantityChange = -item.quantity;
            newQuantity = product.quantity - item.quantity;
          }

          // Update stock quantity
          await tx.product.update({
            where: { id: product.id },
            data: { quantity: newQuantity },
          });

          // Record stock movement audit log
          await tx.stockMovementLog.create({
            data: {
              productId: product.id,
              movementId: movement.id,
              quantityChange,
              previousQuantity: product.quantity,
              newQuantity,
              refCode: movement.code,
              tenantId,
            },
          });
        }

        return tx.warehouseMovement.update({
          where: { id: movement.id },
          data: { status: MovementStatus.COMPLETED },
          include: {
            supplier: true,
            createdBy: {
              select: { id: true, fullName: true, email: true },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    }

    // Handle CANCELLED status transition
    return this.prisma.warehouseMovement.update({
      where: { id: movement.id },
      data: { status: MovementStatus.CANCELLED },
      include: {
        supplier: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getStockLogs(tenantId: string) {
    return this.prisma.stockMovementLog.findMany({
      where: { tenantId },
      include: {
        product: true,
        movement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
