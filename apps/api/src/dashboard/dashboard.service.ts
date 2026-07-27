import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
    });

    const totalProducts = products.length;
    let totalStockQuantity = 0;
    let totalStockValue = 0;
    let lowStockAlertsCount = 0;

    for (const p of products) {
      totalStockQuantity += p.quantity;
      totalStockValue += p.quantity * p.price;
      if (p.quantity <= p.minQuantity) {
        lowStockAlertsCount++;
      }
    }

    const pendingMovementsCount = await this.prisma.warehouseMovement.count({
      where: {
        tenantId,
        status: MovementStatus.PENDING,
      },
    });

    return {
      totalProducts,
      totalStockQuantity,
      totalStockValue,
      pendingMovementsCount,
      lowStockAlertsCount,
    };
  }
}
