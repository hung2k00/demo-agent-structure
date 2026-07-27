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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
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
            throw new common_1.ConflictException(`Mã SKU '${sku}' đã tồn tại trong kho hàng của bạn`);
        }
        let categoryName = dto.category ? dto.category.trim() : 'Chưa phân loại';
        if (dto.categoryId) {
            const catObj = await this.prisma.category.findFirst({
                where: { id: dto.categoryId, tenantId },
            });
            if (catObj) {
                categoryName = catObj.name;
            }
        }
        const product = await this.prisma.product.create({
            data: {
                sku,
                name: dto.name.trim(),
                category: categoryName,
                categoryId: dto.categoryId || undefined,
                unit: dto.unit.trim(),
                minQuantity: dto.minQuantity ?? 5,
                price: dto.price,
                description: dto.description ? dto.description.trim() : undefined,
                quantity: 0,
                tenantId,
            },
            include: {
                categoryObj: true,
            },
        });
        return {
            ...product,
            isLowStock: product.quantity <= product.minQuantity,
        };
    }
    async findAll(tenantId, search, category, categoryId) {
        const where = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        else if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                categoryObj: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return products.map((p) => ({
            ...p,
            isLowStock: p.quantity <= p.minQuantity,
        }));
    }
    async findLowStock(tenantId) {
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            include: {
                categoryObj: true,
            },
            orderBy: { quantity: 'asc' },
        });
        return products
            .filter((p) => p.quantity <= p.minQuantity)
            .map((p) => ({
            ...p,
            isLowStock: true,
        }));
    }
    async findOne(tenantId, id) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                categoryObj: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        }
        return {
            ...product,
            isLowStock: product.quantity <= product.minQuantity,
        };
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        let sku;
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
                throw new common_1.ConflictException(`Mã SKU '${sku}' đã bị trùng lặp`);
            }
        }
        let categoryName;
        if (dto.categoryId) {
            const catObj = await this.prisma.category.findFirst({
                where: { id: dto.categoryId, tenantId },
            });
            if (catObj) {
                categoryName = catObj.name;
            }
        }
        else if (dto.category) {
            categoryName = dto.category.trim();
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...(sku && { sku }),
                ...(dto.name && { name: dto.name.trim() }),
                ...(categoryName && { category: categoryName }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.unit && { unit: dto.unit.trim() }),
                ...(dto.minQuantity !== undefined && { minQuantity: dto.minQuantity }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.description !== undefined && { description: dto.description ? dto.description.trim() : null }),
            },
            include: {
                categoryObj: true,
            },
        });
        return {
            ...product,
            isLowStock: product.quantity <= product.minQuantity,
        };
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.product.delete({
            where: { id },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map