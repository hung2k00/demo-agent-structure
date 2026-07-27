import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllInTenant(tenantId: string): Promise<{
        fullName: string;
        email: string;
        tenantId: string;
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    updateRole(tenantId: string, targetUserId: string, newRole: UserRole): Promise<{
        fullName: string;
        email: string;
        tenantId: string;
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
