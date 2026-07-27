import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(req: any, dto: CreateSupplierDto): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    findAll(req: any): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }[]>;
    findOne(req: any, id: string): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    update(req: any, id: string, dto: UpdateSupplierDto): Promise<{
        email: string | null;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        phone: string | null;
        address: string | null;
    }>;
    remove(req: any, id: string): Promise<{
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
