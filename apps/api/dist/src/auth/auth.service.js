"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async getTenants() {
        return this.prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async register(dto) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        if (!dto.tenantId && (!dto.companyName || !dto.companyName.trim())) {
            throw new common_1.BadRequestException('Vui lòng chọn hoặc nhập tên kho/cửa hàng');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email này đã được sử dụng trong hệ thống');
        }
        try {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(dto.password, saltRounds);
            let tenant;
            let defaultRole = 'ADMIN';
            if (dto.tenantId) {
                tenant = await this.prisma.tenant.findUnique({
                    where: { id: dto.tenantId },
                });
                if (!tenant) {
                    throw new common_1.BadRequestException('Kho/Cửa hàng được chọn không tồn tại');
                }
                const existingUsersCount = await this.prisma.user.count({
                    where: { tenantId: tenant.id },
                });
                defaultRole = existingUsersCount === 0 ? 'ADMIN' : 'STAFF';
            }
            else if (dto.companyName) {
                const inputName = dto.companyName.trim();
                tenant = await this.prisma.tenant.findFirst({
                    where: {
                        name: {
                            equals: inputName,
                            mode: 'insensitive',
                        },
                    },
                });
                if (tenant) {
                    const existingUsersCount = await this.prisma.user.count({
                        where: { tenantId: tenant.id },
                    });
                    defaultRole = existingUsersCount === 0 ? 'ADMIN' : 'STAFF';
                }
                else {
                    tenant = await this.prisma.tenant.create({
                        data: {
                            name: inputName,
                        },
                    });
                    defaultRole = 'ADMIN';
                }
            }
            const newUser = await this.prisma.user.create({
                data: {
                    email: normalizedEmail,
                    fullName: dto.fullName.trim(),
                    passwordHash,
                    role: defaultRole,
                    tenantId: tenant.id,
                },
                include: {
                    tenant: true,
                },
            });
            const payload = {
                sub: newUser.id,
                email: newUser.email,
                role: newUser.role,
                tenantId: newUser.tenantId,
            };
            const accessToken = this.jwtService.sign(payload);
            const { passwordHash: _, ...sanitizedUser } = newUser;
            return {
                accessToken,
                user: {
                    ...sanitizedUser,
                    tenantName: tenant.name,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Lỗi hệ thống khi đăng ký tài khoản');
        }
    }
    async login(dto) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                tenant: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const accessToken = this.jwtService.sign(payload);
        const { passwordHash: _, ...sanitizedUser } = user;
        return {
            accessToken,
            user: {
                ...sanitizedUser,
                tenantName: user.tenant.name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map