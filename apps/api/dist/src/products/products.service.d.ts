import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateProductDto): Promise<{
        isLowStock: boolean;
        categoryObj: {
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            description: string | null;
        } | null;
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }>;
    findAll(tenantId: string, search?: string, category?: string, categoryId?: string): Promise<{
        isLowStock: boolean;
        categoryObj: {
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            description: string | null;
        } | null;
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }[]>;
    findLowStock(tenantId: string): Promise<{
        isLowStock: boolean;
        categoryObj: {
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            description: string | null;
        } | null;
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        isLowStock: boolean;
        categoryObj: {
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            description: string | null;
        } | null;
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateProductDto): Promise<{
        isLowStock: boolean;
        categoryObj: {
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            description: string | null;
        } | null;
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        category: string;
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        sku: string;
        categoryId: string | null;
        unit: string;
        minQuantity: number;
        price: number;
        quantity: number;
    }>;
}
