export declare class CreateProductDto {
    sku: string;
    name: string;
    category?: string;
    categoryId?: string;
    unit: string;
    minQuantity?: number;
    price: number;
    description?: string;
}
export declare class UpdateProductDto {
    sku?: string;
    name?: string;
    category?: string;
    categoryId?: string;
    unit?: string;
    minQuantity?: number;
    price?: number;
    description?: string;
}
