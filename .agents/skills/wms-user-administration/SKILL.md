---
name: wms-user-administration
description: Hướng dẫn quản lý danh sách thành viên, nâng/hạ quyền và phân quyền theo vai trò (User Administration).
---

# WMS User Administration Skill

Skill này hướng dẫn quy trình phát triển và quản lý danh sách nhân viên trong hệ thống SmartWMS.

## 1. Endpoints & Bảo Mật
- `GET /api/v1/users`: Danh sách nhân viên thuộc Tenant. Yêu cầu `@Roles(UserRole.ADMIN)`.
- `PATCH /api/v1/users/:id/role`: Cập nhật vai trò (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`). Yêu cầu `@Roles(UserRole.ADMIN)`.

## 2. Ràng Buộc Multi-Tenant
Tất cả các thao tác truy vấn người dùng bắt buộc lọc theo `tenantId` để tránh can thiệp tài khoản ngoài doanh nghiệp.
