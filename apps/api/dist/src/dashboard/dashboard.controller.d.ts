import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
        totalProducts: number;
        totalStockQuantity: number;
        totalStockValue: number;
        pendingMovementsCount: number;
        lowStockAlertsCount: number;
    }>;
}
