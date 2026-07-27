import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(req: any, dto: CreateProductDto): Promise<{
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
    findAll(req: any, search?: string, category?: string, categoryId?: string): Promise<{
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
    findLowStock(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, dto: UpdateProductDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
