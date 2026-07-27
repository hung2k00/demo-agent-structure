# Quy Tắc Nghiệp Vụ Quản Lý Sản Phẩm & Tồn Kho (Product & Inventory Rules)

Tài liệu này quy định các chuẩn dữ liệu, kiểm tra tồn kho và phân quyền đối với module **Sản Phẩm (`/api/v1/products`)**.

---

## 1. Validation & Định Dạng Dữ Liệu
- **Mã SKU (`sku`)**:
  - Bắt buộc nhập (`@IsNotEmpty()`).
  - Định dạng: Chỉ gồm chữ cái viết hoa `A-Z`, chữ số `0-9` và dấu gạch nối `-` (Regex: `/^[A-Z0-9-]+$/`), ví dụ: `LAP-DELL-XPS15`.
  - **Ràng buộc Duy nhất theo Tenant**: Không được trùng SKU trong cùng một Kho/Cửa hàng (`unique([tenantId, sku])`).
- **Tên & Danh Mục & Đơn Vị Tính (`name`, `category`, `unit`)**:
  - Bắt buộc nhập.
- **Giá Sản Phẩm (`price`)**:
  - Giá nhập/bán không được âm (`min: 0`).
- **Ngưỡng Tồn Kho Tối Thiểu (`minQuantity`)**:
  - Mặc định = 5 nếu không truyền.
  - Khi số lượng tồn kho `quantity <= minQuantity`, hệ thống tự động cờ báo hiệu `isLowStock: true` để cảnh báo lên Dashboard.

---

## 2. Ma Trận Phân Quyền (RBAC)
- **Xem danh sách / Lọc tồn kho thấp (`GET /api/v1/products`, `GET /api/v1/products/low-stock`)**:
  - Cho phép tất cả vai trò (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`).
- **Tạo mới / Cập nhật Sản phẩm (`POST /api/v1/products`, `PUT /api/v1/products/:id`)**:
  - Cho phép **`ADMIN`** và **`WAREHOUSE_MANAGER`**.
- **Xóa Sản phẩm (`DELETE /api/v1/products/:id`)**:
  - Chỉ duy nhất **`ADMIN`** có quyền xóa.

---

## 3. Bảo Vệ Dữ Liệu Tồn Kho
- Tuyệt đối không cho phép sửa trực tiếp cột `quantity` thông qua API update sản phẩm. Số lượng tồn kho `quantity` chỉ biến động duy nhất khi hoàn thành phiếu Nhập/Xuất kho (`COMPLETED`).
