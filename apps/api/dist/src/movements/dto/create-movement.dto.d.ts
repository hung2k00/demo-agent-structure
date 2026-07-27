import { MovementType, MovementStatus } from '@prisma/client';
export declare class MovementItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreateMovementDto {
    type: MovementType;
    supplierId?: string;
    note?: string;
    items: MovementItemDto[];
}
export declare class UpdateMovementStatusDto {
    status: MovementStatus;
}
