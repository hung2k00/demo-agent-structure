# Quy Tắc Thiết Kế Giao Diện Layout & Navigation (UI Layout Rules)

Tài liệu này quy định cấu trúc hiển thị điều hướng (Navigation Menu) và bố cục (Responsive Layout) của hệ thống **SmartWMS Pro**.

---

## 1. Bố Cục Điều Hướng Theo Thiết Bị (Responsive Layout Navigation Rule)
- **Màn hình Laptop / Desktop (Màn hình lớn, không phải Điện thoại hay iPad - `width >= 1024px`)**:
  - Thanh Menu điều hướng chính **BẮT BUỘC hiển thị ở bên trái (Left Sidebar Menu)** với chiều rộng cố định (khoảng `250px` - `260px`).
  - Sidebar chứa:
    1. Logo & Tên Kho Hàng (`SmartWMS Pro` + Tenant Name) ở góc trên cùng.
    2. Danh sách các Tab chức năng xếp theo chiều dọc với Icon, tiêu đề và hiệu ứng Active nổi bật.
    3. Thẻ thông tin cá nhân của Người dùng & Nút Đăng xuất ở góc dưới cùng Sidebar.
- **Màn hình Điện thoại & iPad (Thiết bị di động / Tablet - `width < 1024px`)**:
  - Hiển thị Navbar thu gọn ở phía trên (Top Navbar) hoặc Drawer menu để tối ưu không gian hiển thị cho thiết bị cầm tay.

---

## 2. Chuẩn Thiết Kế Glassmorphism & Visual Aesthetics
- **Sidebar Styling**: Nền sẫm `bg-slate-900/90` hoặc `glass-panel` với viền mờ `border-r border-slate-800`.
- **Active State**: Tab đang chọn phủ hiệu ứng Gradient indigo (`bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30`).
- **Hover State**: Viền mờ và hiệu ứng chuyển màu mượt mà (`hover:bg-slate-800/60 hover:text-slate-200 transition-all`).
