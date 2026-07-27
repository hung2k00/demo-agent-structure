import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateCategoryDto): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateCategoryDto): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        tenantId: string;
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
    }>;
}
