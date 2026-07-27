import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(req: any, dto: CreateCategoryDto): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
    findAll(req: any): Promise<({
        _count: {
            products: number;
        };
    } & {
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        _count: {
            products: number;
        };
    } & {
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
    update(req: any, id: string, dto: UpdateCategoryDto): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
}
