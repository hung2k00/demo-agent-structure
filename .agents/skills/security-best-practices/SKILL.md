---
name: security-best-practices
description: Quy chuẩn an toàn bảo mật cho NestJS Backend (JWT Auth, RBAC, Data Validation, Tenant Isolation).
---

# Quy Chuẩn Bảo Mật Backend NestJS

1. **Authentication & Password**:
   - Sử dụng `bcrypt` / `argon2` để hash mật khẩu.
   - JWT Token gồm Access Token (ngắn hạn) và Refresh Token (lưu mã hóa HTTP-only Cookie hoặc DB).
2. **Authorization (RBAC)**:
   - Sử dụng `@UseGuards(JwtAuthGuard, RolesGuard)` và Decorator `@Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)`.
3. **Data Validation & Sanitation**:
   - Tự động validate bằng `ValidationPipe` kết hợp `class-validator` và `class-transformer` trong NestJS.
4. **Tenant & Data Isolation**:
   - Mọi truy vấn Prisma/SQL liên quan đến Hàng hóa (Inventory), Phiếu Nhập (Import Voucher), Phiếu Xuất (Export Voucher) đều phải lọc theo `tenantId`.
