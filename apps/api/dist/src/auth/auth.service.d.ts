import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getTenants(): Promise<{
        id: string;
        name: string;
    }[]>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            tenantName: any;
            tenant: {
                id: string;
                name: string;
                createdAt: Date;
            };
            fullName: string;
            email: string;
            tenantId: string;
            id: string;
            createdAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            tenantName: string;
            tenant: {
                id: string;
                name: string;
                createdAt: Date;
            };
            fullName: string;
            email: string;
            tenantId: string;
            id: string;
            createdAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
}
