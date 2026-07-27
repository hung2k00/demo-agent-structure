# Quy Tắc Nghiệp Vụ Quản Lý Nhà Cung Cấp (Supplier Rules)

Tài liệu này quy định các chuẩn dữ liệu, ràng buộc và phân quyền đối với module **Nhà Cung Cấp (`/api/v1/suppliers`)**.

---

## 1. Validation & Định Dạng Dữ Liệu
- **Mã Nhà Cung Cấp (`code`)**:
  - Bắt buộc nhập (`@IsNotEmpty()`).
  - Phải tự động viết hoa (UPPERCASE), ví dụ: `SUP-DELL`, `SUP-HOANGHA`.
  - **Ràng buộc Duy nhất theo Tenant**: Không được trùng lặp mã NCC trong cùng một Kho/Cửa hàng (`unique([tenantId, code])`).
- **Tên Nhà Cung Cấp (`name`)**:
  - Bắt buộc nhập (`@IsNotEmpty()`).
- **Email & Số Điện Thoại (`email`, `phone`)**:
  - Email nếu nhập phải đúng định dạng (`@IsEmail()`) và tự động chuyển thành dạng chữ thường.
  - Số điện thoại phải là chuỗi hợp lệ.

---

## 2. Ma Trận Phân Quyền (RBAC)
- **Xem danh sách / Chi tiết (`GET /api/v1/suppliers`, `GET /api/v1/suppliers/:id`)**:
  - Cho phép tất cả người dùng thuộc Tenant (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`).
- **Tạo mới / Cập nhật (`POST /api/v1/suppliers`, `PUT /api/v1/suppliers/:id`)**:
  - Chỉ cho phép **`ADMIN`** và **`WAREHOUSE_MANAGER`**.
- **Xóa Nhà Cung Cấp (`DELETE /api/v1/suppliers/:id`)**:
  - Chỉ duy nhất **`ADMIN`** mới có quyền xóa.

---

## 3. Ràng Buộc Cô Lập Dữ Liệu (Tenant Isolation)
- Mọi thao tác tìm kiếm, tạo mới, sửa, xóa đều phải tự động gắn `tenantId` từ Token đăng nhập của người dùng.
