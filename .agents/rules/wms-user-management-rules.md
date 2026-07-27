# Quy Tắc Nghiệp Vụ Quản Lý Thành Viên & Vai Trò (User Administration Rules)

Tài liệu này quy định các chuẩn quản lý người dùng, nâng/hạ quyền và bảo mật đối với module **Thành Viên (`/api/v1/users`)**.

---

## 1. Phân Quyền Vai Trò (User Roles)
Hệ thống gồm 3 cấp độ vai trò:
1. **`ADMIN`**: Quản trị viên kho hàng. Có toàn quyền quản lý sản phẩm, nhà cung cấp, duyệt phiếu nhập/xuất và cập nhật vai trò nhân viên.
2. **`WAREHOUSE_MANAGER`**: Quản lý kho. Được quyền thêm/sửa sản phẩm, nhà cung cấp, duyệt phiếu nhập/xuất.
3. **`STAFF`**: Nhân viên kho. Được quyền lập phiếu đề xuất (`PENDING`) và xem thông tin kho hàng.

---

## 2. Ma Trận Phân Quyền & Bảo Mật (RBAC)
- **Xem danh sách nhân viên trong kho (`GET /api/v1/users`)**:
  - Chỉ duy nhất **`ADMIN`** mới được phép truy cập.
- **Cập nhật vai trò nhân viên (`PATCH /api/v1/users/:id/role`)**:
  - Chỉ duy nhất **`ADMIN`** mới được phép thay đổi vai trò của người dùng khác trong cùng Tenant.
  - Không cho phép tự thay đổi vai trò của chính mình nếu người đó là Admin duy nhất.

---

## 3. Ràng Buộc Cô Lập Multi-Tenant
- Admin chỉ được quyền xem và cập nhật vai trò của các tài khoản nằm trong cùng `tenantId` với Admin đó.
