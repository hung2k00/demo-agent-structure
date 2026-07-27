# Quy Tắc Nghiệp Vụ Phiếu Nhập Xuất & Nhật Ký Biến Động Kho (Movement & Audit Rules)

Tài liệu này quy định quy trình xử lý nghiệp vụ Nhập/Xuất hàng (SOP) và Phân quyền cho module **Nhập Xuất Kho (`/api/v1/movements`)**.

---

## 1. Quy Chuẩn Mã Phiếu & Trạng Thái
- **Mã Phiếu Tự Động (`code`)**:
  - Phiếu Nhập Kho: `PN-YYYYMMDD-XXXX` (VD: `PN-20260726-4144`).
  - Phiếu Xuất Kho: `PX-YYYYMMDD-XXXX` (VD: `PX-20260726-5497`).
- **Trạng Thái Phiếu (`status`)**:
  - `PENDING`: Trạng thái khởi tạo (Chờ duyệt).
  - `COMPLETED`: Đã hoàn tất và thực hiện cập nhật CSDL tồn kho.
  - `CANCELLED`: Đã hủy (không ảnh hưởng số lượng tồn kho).

---

## 2. Quy Tắc Kiểm Tra Tồn Kho Trước Khi Xuất (Outbound Check)
- Khi lập hoặc duyệt phiếu `EXPORT`:
  - Hệ thống phải đối soát: `Product.quantity >= RequestedQuantity`.
  - Nếu `Product.quantity < RequestedQuantity`, hệ thống **BẮT BUỘC** hủy thao tác, trả về mã lỗi **HTTP 400 Bad Request** với thông điệp `INSUFFICIENT_STOCK`.

---

## 3. Quy Trình Cập Nhật Tồn Kho & Nhật Ký Biến Động (Transaction Audit SOP)
- Việc đổi trạng thái sang `COMPLETED` phải bọc trong một **Prisma Database Transaction** (`$transaction`):
  1. Với `IMPORT`: Tăng `Product.quantity += item.quantity`. Lưu bản ghi `StockMovementLog` với `quantityChange = +quantity`.
  2. Với `EXPORT`: Trừ `Product.quantity -= item.quantity`. Lưu bản ghi `StockMovementLog` với `quantityChange = -quantity`.
  3. Bản ghi `StockMovementLog` bắt buộc lưu vết: `productId`, `movementId`, `quantityChange`, `previousQuantity`, `newQuantity`, `refCode`, `tenantId`, `createdAt`.

---

## 4. Ma Trận Phân Quyền (RBAC)
- **Tạo Phiếu Đề Xuất (`POST /api/v1/movements`)**:
  - Tất cả vai trò (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`) đều được phép tạo phiếu ở trạng thái ban đầu `PENDING`.
- **Duyệt / Hoàn Thành / Hủy Phiếu (`PATCH /api/v1/movements/:id/status`)**:
  - Chỉ **`ADMIN`** và **`WAREHOUSE_MANAGER`** mới có quyền chuyển trạng thái phiếu.
- **Xem Lịch Sử Nhật Ký Biến Động (`GET /api/v1/movements/logs/history`)**:
  - Cho phép tất cả vai trò thuộc Tenant xem audit log.
