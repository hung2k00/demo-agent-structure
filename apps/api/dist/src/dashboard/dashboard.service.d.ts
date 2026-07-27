import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(tenantId: string): Promise<{
        totalProducts: number;
        totalStockQuantity: number;
        totalStockValue: number;
        pendingMovementsCount: number;
        lowStockAlertsCount: number;
    }>;
}
