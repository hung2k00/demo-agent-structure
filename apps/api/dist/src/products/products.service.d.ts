import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateProductDto): Promise<{
        isLowStock: boolean;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }>;
    findAll(tenantId: string, search?: string, category?: string): Promise<{
        isLowStock: boolean;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }[]>;
    findLowStock(tenantId: string): Promise<{
        isLowStock: boolean;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        isLowStock: boolean;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        isLowStock: boolean;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        sku: string;
        category: string;
        unit: string;
        minQuantity: number;
        price: number;
        description: string | null;
        quantity: number;
    }>;
}
