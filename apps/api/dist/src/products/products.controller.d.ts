import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(req: any, dto: CreateProductDto): Promise<{
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
    findAll(req: any, search?: string, category?: string): Promise<{
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
    findLowStock(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, dto: UpdateProductDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
