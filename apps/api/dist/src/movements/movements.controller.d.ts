import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementStatusDto } from './dto/create-movement.dto';
import { MovementType, MovementStatus } from '@prisma/client';
export declare class MovementsController {
    private readonly movementsService;
    constructor(movementsService: MovementsService);
    create(req: any, dto: CreateMovementDto): Promise<{
        supplier: {
            email: string | null;
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            phone: string | null;
            address: string | null;
        } | null;
        items: ({
            product: {
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
            };
        } & {
            id: string;
            price: number;
            quantity: number;
            productId: string;
            movementId: string;
        })[];
        createdBy: {
            fullName: string;
            email: string;
            id: string;
        };
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        code: string;
        type: import("@prisma/client").$Enums.MovementType;
        supplierId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.MovementStatus;
        totalAmount: number;
        createdById: string;
    }>;
    findAll(req: any, type?: MovementType, status?: MovementStatus): Promise<({
        supplier: {
            email: string | null;
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            phone: string | null;
            address: string | null;
        } | null;
        items: ({
            product: {
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
            };
        } & {
            id: string;
            price: number;
            quantity: number;
            productId: string;
            movementId: string;
        })[];
        createdBy: {
            fullName: string;
            email: string;
            id: string;
        };
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        code: string;
        type: import("@prisma/client").$Enums.MovementType;
        supplierId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.MovementStatus;
        totalAmount: number;
        createdById: string;
    })[]>;
    getStockLogs(req: any): Promise<({
        product: {
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
        };
        movement: {
            tenantId: string;
            id: string;
            createdAt: Date;
            code: string;
            type: import("@prisma/client").$Enums.MovementType;
            supplierId: string | null;
            note: string | null;
            status: import("@prisma/client").$Enums.MovementStatus;
            totalAmount: number;
            createdById: string;
        } | null;
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        productId: string;
        movementId: string | null;
        quantityChange: number;
        previousQuantity: number;
        newQuantity: number;
        refCode: string;
    })[]>;
    findOne(req: any, id: string): Promise<{
        supplier: {
            email: string | null;
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            phone: string | null;
            address: string | null;
        } | null;
        items: ({
            product: {
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
            };
        } & {
            id: string;
            price: number;
            quantity: number;
            productId: string;
            movementId: string;
        })[];
        createdBy: {
            fullName: string;
            email: string;
            id: string;
        };
        logs: ({
            product: {
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
            };
        } & {
            tenantId: string;
            id: string;
            createdAt: Date;
            productId: string;
            movementId: string | null;
            quantityChange: number;
            previousQuantity: number;
            newQuantity: number;
            refCode: string;
        })[];
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        code: string;
        type: import("@prisma/client").$Enums.MovementType;
        supplierId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.MovementStatus;
        totalAmount: number;
        createdById: string;
    }>;
    updateStatus(req: any, id: string, dto: UpdateMovementStatusDto): Promise<{
        supplier: {
            email: string | null;
            tenantId: string;
            id: string;
            name: string;
            createdAt: Date;
            code: string;
            phone: string | null;
            address: string | null;
        } | null;
        items: ({
            product: {
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
            };
        } & {
            id: string;
            price: number;
            quantity: number;
            productId: string;
            movementId: string;
        })[];
        createdBy: {
            fullName: string;
            email: string;
            id: string;
        };
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        code: string;
        type: import("@prisma/client").$Enums.MovementType;
        supplierId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.MovementStatus;
        totalAmount: number;
        createdById: string;
    }>;
}
