"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(tenantId) {
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
                status: client_1.MovementStatus.PENDING,
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map