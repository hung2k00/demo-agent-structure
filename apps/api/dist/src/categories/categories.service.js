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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
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
            throw new common_1.ConflictException(`Mã danh mục '${code}' đã tồn tại trong kho hàng của bạn`);
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
            throw new common_1.ConflictException(`Tên danh mục '${name}' đã tồn tại trong kho hàng của bạn`);
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
    async findAll(tenantId) {
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
    async findOne(tenantId, id) {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Không tìm thấy danh mục');
        }
        return category;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        let code;
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
                throw new common_1.ConflictException(`Mã danh mục '${code}' đã bị trùng lặp`);
            }
        }
        let name;
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
                throw new common_1.ConflictException(`Tên danh mục '${name}' đã bị trùng lặp`);
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
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map