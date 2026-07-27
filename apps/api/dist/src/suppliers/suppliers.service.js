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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
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
            throw new common_1.ConflictException(`Mã nhà cung cấp '${code}' đã tồn tại trong hệ thống`);
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
    async findAll(tenantId) {
        return this.prisma.supplier.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, id) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, tenantId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException('Không tìm thấy thông tin nhà cung cấp');
        }
        return supplier;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        let code;
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
                throw new common_1.ConflictException(`Mã nhà cung cấp '${code}' đã trùng lặp`);
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
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.supplier.delete({
            where: { id },
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map