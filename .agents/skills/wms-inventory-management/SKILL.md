---
name: wms-inventory-management
description: Hướng dẫn kỹ thuật và quy chuẩn phát triển Quản lý Tồn Kho & Sản Phẩm cho SmartWMS (SKU, Low Stock Warning, Tenant Isolation).
---

# WMS Inventory Management Skill

Skill này hướng dẫn chi tiết cách bảo trì và phát triển tính năng Quản Lý Sản Phẩm và Tồn Kho trong hệ thống SmartWMS.

## 1. Kiến Trúc & Data Model
- Model Prisma: `Product` trong `apps/api/prisma/schema.prisma`.
- Interface DTO: `ProductDto`, `CreateProductDto`, `UpdateProductDto` trong `packages/shared-types/index.ts`.

## 2. Kiểm Tra Ràng Buộc Mã SKU
- Chuẩn Regex SKU: `/^[A-Z0-9-]+$/`.
- Đảm bảo tính duy nhất của SKU theo từng Tenant:
```typescript
await prisma.product.findUnique({
  where: {
    tenantId_sku: { tenantId, sku }
  }
});
```

## 3. Cảnh Báo Tồn Kho Thấp (`LOW_STOCK`)
- Bất kỳ truy vấn sản phẩm nào đều tự động tính toán thuộc tính `isLowStock`:
```typescript
isLowStock: product.quantity <= product.minQuantity
```
- Endpoint `GET /api/v1/products/low-stock` dùng để truy xuất danh sách các sản phẩm đang chạm hoặc dưới ngưỡng tồn tối thiểu.
