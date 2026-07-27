export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  STAFF = 'STAFF',
}

export enum MovementType {
  IMPORT = 'IMPORT', // Nhập hàng
  EXPORT = 'EXPORT', // Xuất hàng
}

export enum MovementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// User & Auth
export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
  tenantId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  tenantName?: string;
  createdAt?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

// Supplier
export interface SupplierDto {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tenantId: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Product
export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  price: number;
  description?: string;
  isLowStock?: boolean;
  tenantId?: string;
  createdAt?: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  category: string;
  unit: string;
  minQuantity?: number;
  price: number;
  description?: string;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  category?: string;
  unit?: string;
  minQuantity?: number;
  price?: number;
  description?: string;
}

// Movement & Movement Items
export interface WarehouseMovementItemDto {
  id?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  price: number;
}

export interface WarehouseMovementDto {
  id: string;
  code: string;
  type: MovementType;
  status: MovementStatus;
  supplierId?: string;
  supplierName?: string;
  items: WarehouseMovementItemDto[];
  totalAmount: number;
  note?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateMovementDto {
  type: MovementType;
  supplierId?: string;
  note?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateMovementStatusDto {
  status: MovementStatus;
}

// Movement Log
export interface StockMovementLogDto {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  movementId?: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  refCode: string;
  createdAt: string;
}

// Dashboard
export interface DashboardStatsDto {
  totalProducts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  pendingMovementsCount: number;
  lowStockAlertsCount: number;
}
