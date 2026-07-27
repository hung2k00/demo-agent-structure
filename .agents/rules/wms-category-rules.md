# Quy Tắc Nghiệp Vụ Quản Lý Danh Mục Sản Phẩm (Category Rules)

Tài liệu này quy định các chuẩn dữ liệu, kiểm tra hợp lệ và phân quyền đối với module **Danh Mục Sản Phẩm (`/api/v1/categories`)**.

---

## 1. Validation & Định Dạng Dữ Liệu
- **Mã Danh Mục (`code`)**:
  - Bắt buộc nhập (`@IsNotEmpty()`).
  - Phải tự động viết hoa (UPPERCASE), chỉ chứa chữ cái `A-Z`, chữ số `0-9` và `-` (VD: `CAT-DIENTU`, `CAT-MAYTINH`).
  - **Ràng buộc Duy nhất theo Tenant**: Không được trùng lặp mã danh mục trong cùng 1 Kho/Cửa hàng (`unique([tenantId, code])`).
- **Tên Danh Mục (`name`)**:
  - Bắt buộc nhập. Duy nhất theo từng Tenant (`unique([tenantId, name])`).
- **Mô Tả (`description`)**:
  - Tùy chọn.

---

## 2. Ràng Buộc Liên Kết Với Sản Phẩm
- Mỗi Sản phẩm (`Product`) có thể liên kết với một Danh mục (`categoryId`).
- Khi người dùng tạo mới hoặc cập nhật Sản phẩm, hệ thống cho phép chọn Danh mục từ danh sách các Danh mục đã có của Kho hàng.
- Cho phép lọc danh sách Sản phẩm theo `categoryId` hoặc tên Danh mục.

---

## 3. Ma Trận Phân Quyền (RBAC)
- **Xem danh sách / Chi tiết (`GET /api/v1/categories`, `GET /api/v1/categories/:id`)**:
  - Cho phép tất cả người dùng thuộc Tenant (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`).
- **Tạo mới / Cập nhật Danh mục (`POST /api/v1/categories`, `PUT /api/v1/categories/:id`)**:
  - Cho phép **`ADMIN`** và **`WAREHOUSE_MANAGER`**.
- **Xóa Danh mục (`DELETE /api/v1/categories/:id`)**:
  - Chỉ duy nhất **`ADMIN`** mới có quyền xóa.
