---
name: wms-category-management
description: Hướng dẫn kỹ thuật phát triển module Quản Lý Danh Mục Sản Phẩm cho SmartWMS (Category CRUD, Unique code/name per tenant, Product filtering).
---

# WMS Category Management Skill

Skill này hướng dẫn quy trình xây dựng và bảo trì module Quản Lý Danh Mục Sản Phẩm và tích hợp lọc sản phẩm theo danh mục.

## 1. Cấu Trúc Data & DTO
- Model Prisma: `Category` trong `schema.prisma`.
- DTO Interfaces: `CategoryDto`, `CreateCategoryDto`, `UpdateCategoryDto` trong `packages/shared-types`.

## 2. Quy Chuẩn Code & Uniqueness
- Mã danh mục (`code`) tự động viết hoa (UPPERCASE).
- Đảm bảo tính duy nhất của mã và tên danh mục theo `tenantId`:
```typescript
await prisma.category.findUnique({
  where: {
    tenantId_code: { tenantId, code }
  }
});
```

## 3. Lọc Sản Phẩm Theo Danh Mục
- Trong `ProductsService`, hỗ trợ lọc sản phẩm theo `categoryId` hoặc `category`:
```typescript
if (categoryId) {
  where.categoryId = categoryId;
}
```
