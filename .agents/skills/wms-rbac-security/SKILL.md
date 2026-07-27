---
name: wms-rbac-security
description: Chuẩn phân quyền RBAC (@Roles), Passport JWT Strategy và Cô lập dữ liệu Multi-Tenancy trong NestJS Backend.
---

# WMS RBAC & Security Skill

Skill này hướng dẫn quy chuẩn bảo mật, phân quyền theo vai trò người dùng và cô lập dữ liệu multi-tenant trong hệ thống SmartWMS.

## 1. Cấu Trúc Guards & Decorators
Mọi Controller yêu cầu đăng nhập và phân quyền phải áp dụng các Guard:
```typescript
@Controller('feature')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeatureController {
  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async create() { ... }
}
```

## 2. Ma Trận Vai Trò (User Roles)
- **`ADMIN`**: Toàn quyền cấu hình, CRUD Sản phẩm, Nhà cung cấp, Người dùng, Duyệt phiếu.
- **`WAREHOUSE_MANAGER`**: Duyệt phiếu, CRUD Sản phẩm, Nhà cung cấp. Không có quyền đổi vai trò user hoặc xóa tài nguyên hệ thống.
- **`STAFF`**: Lập phiếu đề xuất (`PENDING`), xem tồn kho, xem nhà cung cấp.

## 3. Ràng Buộc Cô Lập Multi-Tenant
Mọi truy vấn dữ liệu từ CSDL phải bao gồm `tenantId` lấy từ `req.user.tenantId`:
```typescript
const tenantId = req.user.tenantId;
await this.prisma.entity.findMany({ where: { tenantId } });
```
