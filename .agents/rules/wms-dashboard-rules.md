# Quy Tắc Nghiệp Vụ Bảng Điều Khiển & Thống Kê (Dashboard Rules)

Tài liệu này quy định các chuẩn tính toán, thống kê real-time và hiển thị dữ liệu cho **Bảng Điều Khiển (`/api/v1/dashboard/stats`)**.

---

## 1. Công Thức & Chỉ Số Thống Kê Real-time
- **Tổng Sản Phẩm (`totalProducts`)**:
  - Đếm tổng số lượng bản ghi sản phẩm thuộc `tenantId` của người dùng hiện tại.
- **Tổng Số Lượng Tồn Kho (`totalStockQuantity`)**:
  - Tổng số lượng sản phẩm đang có trong kho (`SUM(Product.quantity)`).
- **Tổng Giá Trị Kho Hàng (`totalStockValue`)**:
  - Tổng giá trị quy đổi theo đơn giá sản phẩm (`SUM(Product.quantity * Product.price)`).
- **Số Phiếu Chờ Duyệt (`pendingMovementsCount`)**:
  - Tổng số lượng phiếu Nhập/Xuất kho ở trạng thái `PENDING`.
- **Cảnh Báo Tồn Kho Thấp (`lowStockAlertsCount`)**:
  - Tổng số sản phẩm có `quantity <= minQuantity`.

---

## 2. Ma Trận Phân Quyền (RBAC)
- tất cả các vai trò (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`) đều được phép xem thông tin Thống kê tổng quan Bảng điều khiển của Kho/Cửa hàng mình đang tham gia.

---

## 3. Ràng Buộc Cô Lập Multi-Tenant
- Dữ liệu thống kê Dashboard bắt buộc chỉ được gom nhóm theo `tenantId` của người dùng đang đăng nhập.
