import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
}
