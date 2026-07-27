import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateSupplierDto): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    findAll(tenantId: string): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateSupplierDto): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
}
