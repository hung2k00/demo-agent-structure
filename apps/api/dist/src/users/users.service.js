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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllInTenant(tenantId) {
        const users = await this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                tenantId: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async updateRole(tenantId, targetUserId, newRole) {
        const user = await this.prisma.user.findFirst({
            where: { id: targetUserId, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng trong hệ thống');
        }
        if (!Object.values(client_1.UserRole).includes(newRole)) {
            throw new common_1.BadRequestException('Vai trò mới không hợp lệ');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                tenantId: true,
                createdAt: true,
            },
        });
        return updatedUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map