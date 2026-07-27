# AGENTS & GEMINI CUSTOM RULES FOR WAREHOUSE MANAGEMENT SYSTEM (WMS) MONOREPO

## Architecture Overview
- **Monorepo Manager**: `pnpm` workspace
- **Backend (`apps/api`)**: NestJS (Express) + PostgreSQL + Prisma ORM
- **Frontend (`apps/web`)**: Vue 3 + Vite + TailwindCSS + Pinia + Lucide Icons
- **Shared (`packages/shared-types`)**: DTOs, Enums, Interfaces cho Hệ thống Quản Lý Xuất Nhập Hàng Hóa

## Active Registered Rules
- `.agents/rules/user-registration-rules.md`: Quy tắc đăng ký tài khoản & chọn kho hàng (Validation DTO, Bcrypt Salt >= 10, Uniqueness Email, Tenant Selection / Initializer).
- `.agents/rules/wms-business-rules.md`: Quy tắc tổng quan nghiệp vụ quản lý kho (FIFO, Mã phiếu, Log biến động kho, RBAC Matrix).
- `.agents/rules/wms-supplier-rules.md`: Quy tắc quản lý Nhà cung cấp (Mã SUP unique theo Tenant, Phân quyền RBAC).
- `.agents/rules/wms-category-rules.md`: Quy tắc quản lý Danh mục sản phẩm (Mã CAT unique theo Tenant, Chọn & Filter danh mục sản phẩm).
- `.agents/rules/wms-product-rules.md`: Quy tắc quản lý Sản phẩm & Tồn kho (Mã SKU format UPPERCASE, Cảnh báo LOW_STOCK, Chặn sửa trực tiếp số lượng).
- `.agents/rules/wms-movement-rules.md`: Quy tắc Phiếu Nhập/Xuất kho (Mã PN/PX, Kiểm tra tồn kho trước khi xuất INSUFFICIENT_STOCK, Prisma Transaction audit log).
- `.agents/rules/wms-dashboard-rules.md`: Quy tắc Bảng điều khiển & Thống kê dữ liệu real-time (Tính tổng tồn kho, giá trị kho hàng, cảnh báo tồn thấp).
- `.agents/rules/wms-user-management-rules.md`: Quy tắc Quản lý Thành viên & Phân quyền Admin (`GET /api/v1/users`, `PATCH /api/v1/users/:id/role`).
- `.agents/rules/wms-ui-layout-rules.md`: Quy tắc thiết kế điều hướng (Hiển thị Sidebar bên trái cho Laptop/Desktop, Top Navbar cho Điện thoại/iPad).

## Active Registered Skills
- `.agents/skills/design-taste-frontend`: Thiết kế UI/UX sang trọng, Glassmorphism, TailwindCSS & Micro-animations cho Vue 3.
- `.agents/skills/security-best-practices`: Chuẩn bảo mật NestJS JWT Auth, Password Hashing, RBAC Guard và Data Validation.
- `.agents/skills/wms-inventory-management`: Quy chuẩn phát triển Quản lý Tồn Kho & Sản Phẩm (SKU, Low Stock Warning, Tenant Isolation).
- `.agents/skills/wms-movement-workflow`: Quy chuẩn xử lý Nhập/Xuất kho (SOP), Check tồn kho trước xuất, Transaction & Audit Log.
- `.agents/skills/wms-rbac-security`: Chuẩn phân quyền RBAC (@Roles), Passport JWT Strategy và Cô lập dữ liệu Multi-Tenancy.
- `.agents/skills/wms-supplier-management`: Hướng dẫn phát triển Quản lý Nhà Cung Cấp (Code uniqueness, validation, RBAC).
- `.agents/skills/wms-category-management`: Hướng dẫn phát triển Quản lý Danh Mục Sản Phẩm (Code uniqueness, product filtering).
- `.agents/skills/wms-dashboard-analytics`: Hướng dẫn phát triển Bảng điều khiển & Thống kê tài chính/tồn kho real-time.
- `.agents/skills/wms-user-administration`: Hướng dẫn quản lý thành viên, đổi vai trò và phân quyền Admin.

## Gemini / Antigravity Agent Guidelines
1. **Schema-First Alignment**:
   - Mọi Data Model (Category, Product, Supplier, WarehouseMovement, StockMovementLog) & Auth DTOs phải định nghĩa trước trong `packages/shared-types`.

2. **User Registration & Auth Enforcement**:
   - Bắt buộc tuân thủ quy tắc trong `.agents/rules/user-registration-rules.md`.
   - Email kiểm tra trùng lặp (Uniqueness check), Mật khẩu mã hoá Bcrypt (Salt >= 10).
   - Chọn kho cũ -> role `STAFF`, Tạo kho mới -> role `ADMIN`.
   - Loại bỏ hoàn toàn `password` khỏi response object trả về.

3. **WMS Business Rules Enforcement**:
   - Tuân thủ nghiêm ngặt các quy tắc trong `.agents/rules/wms-business-rules.md` và `.agents/rules/wms-movement-rules.md`.
   - Phiếu xuất (`EXPORT`) bắt buộc kiểm tra tồn kho `quantity >= requestedQuantity` trước khi duyệt.
   - Số lượng kho chỉ cập nhật khi trạng thái chuyển sang `COMPLETED` trong một Prisma Transaction.

4. **Backend Guidelines (`apps/api`)**:
   - Định tuyến NestJS Controller tiền tố `/api/v1`.
   - Áp dụng `JwtAuthGuard` và `RolesGuard` với decorator `@Roles(...)`.
   - Bắt buộc dùng `ValidationPipe` toàn cục.

5. **Frontend Guidelines (`apps/web`)**:
   - Sử dụng Composition API `<script setup lang="ts">`.
   - Đảm bảo thiết kế giao diện Premium theo skill `design-taste-frontend` và quy tắc `wms-ui-layout-rules.md` (Sidebar bên trái trên Desktop/Laptop).
