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
exports.MovementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MovementsService = class MovementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateReceiptCode(type) {
        const prefix = type === client_1.MovementType.IMPORT ? 'PN' : 'PX';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${dateStr}-${randomSuffix}`;
    }
    async create(tenantId, createdById, dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Phiếu nhập/xuất phải chứa ít nhất 1 mặt hàng');
        }
        let totalAmount = 0;
        for (const item of dto.items) {
            const product = await this.prisma.product.findFirst({
                where: { id: item.productId, tenantId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Sản phẩm (ID: ${item.productId}) không tồn tại trong kho`);
            }
            if (dto.type === client_1.MovementType.EXPORT && product.quantity < item.quantity) {
                throw new common_1.BadRequestException(`INSUFFICIENT_STOCK: Sản phẩm '${product.name}' (SKU: ${product.sku}) hiện chỉ còn ${product.quantity} ${product.unit}, không đủ để xuất ${item.quantity} ${product.unit}`);
            }
            totalAmount += item.quantity * item.price;
        }
        if (dto.supplierId) {
            const supplier = await this.prisma.supplier.findFirst({
                where: { id: dto.supplierId, tenantId },
            });
            if (!supplier) {
                throw new common_1.NotFoundException('Nhà cung cấp không tồn tại');
            }
        }
        const code = this.generateReceiptCode(dto.type);
        const movement = await this.prisma.warehouseMovement.create({
            data: {
                code,
                type: dto.type,
                status: client_1.MovementStatus.PENDING,
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
    async findAll(tenantId, type, status) {
        const where = { tenantId };
        if (type)
            where.type = type;
        if (status)
            where.status = status;
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
    async findOne(tenantId, id) {
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
            throw new common_1.NotFoundException('Không tìm thấy thông tin phiếu nhập/xuất');
        }
        return movement;
    }
    async updateStatus(tenantId, id, dto) {
        const movement = await this.findOne(tenantId, id);
        if (movement.status === dto.status) {
            return movement;
        }
        if (movement.status === client_1.MovementStatus.COMPLETED || movement.status === client_1.MovementStatus.CANCELLED) {
            throw new common_1.BadRequestException(`Phiếu đã ở trạng thái ${movement.status}, không thể thay đổi nữa`);
        }
        if (dto.status === client_1.MovementStatus.COMPLETED) {
            return this.prisma.$transaction(async (tx) => {
                for (const item of movement.items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });
                    if (!product) {
                        throw new common_1.NotFoundException(`Không tìm thấy sản phẩm ${item.productId}`);
                    }
                    let newQuantity = product.quantity;
                    let quantityChange = 0;
                    if (movement.type === client_1.MovementType.IMPORT) {
                        quantityChange = item.quantity;
                        newQuantity = product.quantity + item.quantity;
                    }
                    else if (movement.type === client_1.MovementType.EXPORT) {
                        if (product.quantity < item.quantity) {
                            throw new common_1.BadRequestException(`INSUFFICIENT_STOCK: Sản phẩm '${product.name}' hiện chỉ còn ${product.quantity}, không đủ để duyệt xuất ${item.quantity}`);
                        }
                        quantityChange = -item.quantity;
                        newQuantity = product.quantity - item.quantity;
                    }
                    await tx.product.update({
                        where: { id: product.id },
                        data: { quantity: newQuantity },
                    });
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
                    data: { status: client_1.MovementStatus.COMPLETED },
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
        return this.prisma.warehouseMovement.update({
            where: { id: movement.id },
            data: { status: client_1.MovementStatus.CANCELLED },
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
    async getStockLogs(tenantId) {
        return this.prisma.stockMovementLog.findMany({
            where: { tenantId },
            include: {
                product: true,
                movement: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.MovementsService = MovementsService;
exports.MovementsService = MovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MovementsService);
//# sourceMappingURL=movements.service.js.map