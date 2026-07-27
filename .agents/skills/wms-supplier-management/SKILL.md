---
name: wms-supplier-management
description: Hướng dẫn kỹ thuật và phát triển module Quản lý Nhà Cung Cấp cho SmartWMS (Code uniqueness, validation, tenant isolation).
---

# WMS Supplier Management Skill

Skill này cung cấp các hướng dẫn kỹ thuật chi tiết khi xây dựng và mở rộng tính năng Quản lý Nhà Cung Cấp.

## 1. Cấu Trúc Data & DTO
- Model Prisma: `Supplier` trong `schema.prisma`.
- DTO Interfaces: `CreateSupplierDto`, `UpdateSupplierDto`, `SupplierDto` trong `packages/shared-types`.

## 2. Quy Chuẩn Validation & Chống Trùng Mã
- Mã Nhà Cung Cấp (`code`) phải tự động được viết hoa (UPPERCASE).
- Kiểm tra tính duy nhất của mã NCC theo `tenantId`:
```typescript
await prisma.supplier.findUnique({
  where: {
    tenantId_code: { tenantId, code }
  }
});
```

## 3. Phân Quyền Thao Tác (RBAC)
- `POST` / `PUT`: Sử dụng `@Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)`
- `DELETE`: Sử dụng `@Roles(UserRole.ADMIN)`
