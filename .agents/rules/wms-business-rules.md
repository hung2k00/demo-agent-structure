# Quy Tắc Nghiệp Vụ & API Chi Tiết Quản Lý Kho (WMS Business & API Rules)

Tài liệu này định nghĩa đầy đủ các quy tắc nghiệp vụ, tính hợp lệ dữ liệu, ma trận phân quyền (RBAC) và đặc tả API của Hệ thống Quản Lý Kho (SmartWMS).

---

## 1. Ma Trận Phân Quyền & Bảo Mật (RBAC & Multi-Tenancy Matrix)

Hệ thống có 3 vai trò (UserRole):
- **`ADMIN`**: Quản trị viên kho. Toàn quyền CRUD Sản phẩm, Nhà cung cấp, Người dùng, Duyệt Phiếu Nhập/Xuất kho và xem Thống kê.
- **`WAREHOUSE_MANAGER`**: Quản lý kho. Quyền CRUD Sản phẩm, Nhà cung cấp, Duyệt Phiếu Nhập/Xuất kho và xem Thống kê. Không có quyền sửa vai trò người dùng hoặc xóa Nhà cung cấp / Sản phẩm.
- **`STAFF`**: Nhân viên kho. Quyền Tạo phiếu đề xuất Nhập/Xuất kho (`PENDING`), Xem danh sách sản phẩm, tồn kho và danh sách Nhà cung cấp.

| Chức năng / Endpoint | ADMIN | WAREHOUSE_MANAGER | STAFF |
|---|---|---|---|
| `GET /api/v1/auth/profile` | ✅ | ✅ | ✅ |
| `GET /api/v1/users` | ✅ | ❌ | ❌ |
| `PATCH /api/v1/users/:id/role` | ✅ | ❌ | ❌ |
| `GET /api/v1/suppliers` | ✅ | ✅ | ✅ |
| `POST/PUT /api/v1/suppliers` | ✅ | ✅ | ❌ |
| `DELETE /api/v1/suppliers/:id` | ✅ | ❌ | ❌ |
| `GET /api/v1/products` | ✅ | ✅ | ✅ |
| `POST/PUT /api/v1/products` | ✅ | ✅ | ❌ |
| `DELETE /api/v1/products/:id` | ✅ | ❌ | ❌ |
| `GET /api/v1/movements` | ✅ | ✅ | ✅ |
| `POST /api/v1/movements` | ✅ | ✅ | ✅ (`PENDING`) |
| `PATCH /api/v1/movements/:id/status` | ✅ | ✅ | ❌ |
| `GET /api/v1/movements/logs/history` | ✅ | ✅ | ✅ |
| `GET /api/v1/dashboard/stats` | ✅ | ✅ | ✅ |

---

## 2. Quy Tắc Chi Tiết Theo Tính Năng

### A. Quản Lý Nhà Cung Cấp (Suppliers)
- Mã NCC (`code`): Bắt buộc, viết hoa (VD: `NCC-HOANGHA`, `NCC-DELL`). Duy nhất theo từng Tenant (`tenantId`).
- Validate Email & Số điện thoại nếu được truyền lên.

### B. Quản Lý Sản Phẩm (Products)
- Mã SKU (`sku`): Bắt buộc, viết hoa, không khoảng trắng, cho phép gạch nối (VD: `IPHONE-15-PRO`). Duy nhất theo từng Tenant.
- Ngưỡng cảnh báo tồn tối thiểu (`minQuantity`): Mặc định = 5. Nếu `quantity <= minQuantity`, hệ thống tự động cờ đánh dấu `LOW_STOCK`.

### C. Quản Lý Nhập/Xuất Kho (Movements & Inventory Audit SOP)
1. **Khởi Tạo Phiếu (`POST /api/v1/movements`)**:
   - Loại phiếu (`type`): `IMPORT` (Nhập kho) hoặc `EXPORT` (Xuất kho).
   - Mã phiếu tự động: `PN-YYYYMMDD-XXXX` cho Nhập kho, `PX-YYYYMMDD-XXXX` cho Xuất kho.
   - **Ràng buộc Xuất kho**: Trước khi tạo hoặc duyệt phiếu `EXPORT`, bắt buộc kiểm tra `Product.quantity >= Item.quantity`. Nếu không đủ, trả về `400 Bad Request` với mã lỗi `INSUFFICIENT_STOCK`.
   - Trạng thái ban đầu: `PENDING`.

2. **Duyệt & Chuyển Trạng Thái (`PATCH /api/v1/movements/:id/status`)**:
   - Khi chuyển trạng thái từ `PENDING` sang `COMPLETED`:
     - Nếu là `IMPORT`: Tăng `Product.quantity += item.quantity`. Tạo bản ghi `StockMovementLog` với `quantityChange = +N`.
     - Nếu là `EXPORT`: Giảm `Product.quantity -= item.quantity`. Tạo bản ghi `StockMovementLog` với `quantityChange = -N`.
   - Khi chuyển sang `CANCELLED`: Không làm thay đổi số lượng tồn kho.

---

## 3. Cô Lập Dữ Liệu multi-Tenant (Tenant Isolation)
- Mọi câu lệnh truy vấn CSDL đều bắt buộc có điều kiện `WHERE tenantId = req.user.tenantId`.
