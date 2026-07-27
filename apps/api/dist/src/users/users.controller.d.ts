import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(req: any): Promise<{
        fullName: string;
        email: string;
        tenantId: string;
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    updateRole(req: any, id: string, role: UserRole): Promise<{
        fullName: string;
        email: string;
        tenantId: string;
        id: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
