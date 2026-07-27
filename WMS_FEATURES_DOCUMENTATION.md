# Tài Liệu Mô Tả Chi Tiết Các Tính Năng Hệ Thống Quản Lý Kho (SmartWMS)

Tài liệu này mô tả chi tiết từng tính năng nghiệp vụ, quy trình xử lý, kiểm tra dữ liệu (Validation), phân quyền (RBAC) và các API liên quan trong hệ thống **SmartWMS Pro**.

---

## 1. Tính Năng Đăng Ký Tài Khoản & Lựa Chọn Cửa Hàng / Kho Hàng

### 🎯 Mục đích
Cho phép người dùng mới tạo tài khoản để sử dụng hệ thống. Người dùng có thể chọn tham gia một Kho/Cửa hàng có sẵn hoặc tự đăng ký khởi tạo một Kho/Cửa hàng hoàn toàn mới.

### 📜 Quy tắc nghiệp vụ & Validation
- **Họ tên**: Bắt buộc từ 2 đến 50 ký tự.
- **Email**: Bắt buộc đúng định dạng email, tự động chuyển về chữ thường. Kiểm tra duy nhất trong toàn hệ thống (Trả về `409 Conflict` nếu trùng).
- **Mật khẩu**: Tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt. Mã hóa bằng thuật toán `bcrypt` (`saltRounds >= 10`).
- **Chọn / Tạo Kho Hàng**:
  - Khi chọn Kho có sẵn (`tenantId`): Gán người dùng vào Kho đó với vai trò mặc định **`STAFF`** (Nhân viên).
  - Khi nhập tên Kho mới (`companyName`): Hệ thống tự động tạo bản ghi `Tenant` mới và gán vai trò người dùng là **`ADMIN`** (Quản trị viên kho).
- **Bảo mật**: Loại bỏ hoàn toàn `passwordHash` khỏi kết quả trả về, tự động phát hành JWT Access Token.

### 🔗 Danh sách API
- `GET /api/v1/auth/tenants`: Lấy danh sách các Kho hàng hiện có để hiển thị trên giao diện đăng ký.
- `POST /api/v1/auth/register`: Thực hiện đăng ký tài khoản và gắn với Tenant.

---

## 2. Tính Năng Đăng Nhập & Xác Thực Hệ Thống (Authentication)

### 🎯 Mục đích
Xác thực danh tính người dùng và cấp chứng thư số JWT để truy cập các tài nguyên kho được phân quyền.

### 📜 Quy tắc nghiệp vụ & Validation
- Kiểm tra email và so sánh mật khẩu mã hóa bằng `bcrypt.compare()`.
- Trả về mã lỗi `401 Unauthorized` nếu email hoặc mật khẩu không chính xác.
- Trả về `accessToken` chứa payload: `sub` (User ID), `email`, `role`, `tenantId`.

### 🔗 Danh sách API
- `POST /api/v1/auth/login`: Đăng nhập vào hệ thống.
- `GET /api/v1/auth/profile`: Lấy thông tin cá nhân của người dùng đang đăng nhập (Yêu cầu JWT Bearer Token).

---

## 3. Tính Năng Bảng Điều Khiển & Thống Kê Real-time (Dashboard Analytics)

### 🎯 Mục đích
Cung cấp cái nhìn tổng quan theo thời gian thực về tình hình vận hành kho, tổng sản phẩm, số lượng tồn kho, giá trị tài sản kho hàng, phiếu chờ duyệt và cảnh báo tồn kho thấp.

### 📜 Quy tắc nghiệp vụ & Validation
- Tự động tổng hợp số liệu real-time:
  - **Tổng sản phẩm**: Đếm tổng số mặt hàng trong kho.
  - **Tổng lượng tồn kho**: Tổng số lượng sản phẩm hiện có.
  - **Tổng giá trị kho**: Tổng số tiền quy đổi theo đơn giá sản phẩm.
  - **Phiếu chờ duyệt**: Số lượng phiếu Nhập/Xuất kho ở trạng thái `PENDING`.
  - **Cảnh báo tồn thấp**: Số sản phẩm có `quantity <= minQuantity`.
- **Cô lập dữ liệu**: Chỉ tính toán số liệu thuộc về `tenantId` của người dùng.

### 🔗 Danh sách API
- `GET /api/v1/dashboard/stats`: Lấy thông số thống kê tổng quan của Kho hàng.

---

## 4. Tính Năng Quản Lý Nhà Cung Cấp (Supplier Management)

### 🎯 Mục đích
Quản lý danh sách các nhà cung cấp vật tư, linh kiện hoặc hàng hóa cho kho.

### 📜 Quy tắc nghiệp vụ & Validation
- **Mã nhà cung cấp (`code`)**: Viết hoa (UPPERCASE), duy nhất trong cùng 1 Tenant.
- **Tên nhà cung cấp (`name`)**: Bắt buộc nhập.
- **Phân quyền RBAC**:
  - `ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`: Xem danh sách & chi tiết.
  - `ADMIN`, `WAREHOUSE_MANAGER`: Thêm mới & Cập nhật.
  - `ADMIN`: Xóa nhà cung cấp.

### 🔗 Danh sách API
- `GET /api/v1/suppliers`: Danh sách nhà cung cấp.
- `GET /api/v1/suppliers/:id`: Chi tiết nhà cung cấp.
- `POST /api/v1/suppliers`: Thêm mới nhà cung cấp.
- `PUT /api/v1/suppliers/:id`: Cập nhật thông tin nhà cung cấp.
- `DELETE /api/v1/suppliers/:id`: Xóa nhà cung cấp.

---

## 5. Tính Năng Quản Lý Sản Phẩm & Tồn Kho (Product Management)

### 🎯 Mục đích
Quản lý danh mục hàng hóa, theo dõi số lượng tồn kho, ngưỡng tồn tối thiểu và cảnh báo hết hàng.

### 📜 Quy tắc nghiệp vụ & Validation
- **Mã SKU**: Viết hoa, chỉ chứa `A-Z`, `0-9` và `-` (Regex: `/^[A-Z0-9-]+$/`), duy nhất theo Tenant.
- **Giá sản phẩm (`price`)**: Không được âm.
- **Chặn sửa trực tiếp số lượng tồn kho (`quantity`)**: Số lượng chỉ biến động thông qua phiếu Nhập/Xuất kho.
- **Phân quyền RBAC**:
  - `ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`: Xem danh sách & Cảnh báo tồn thấp.
  - `ADMIN`, `WAREHOUSE_MANAGER`: Thêm mới & Sửa thông tin sản phẩm.
  - `ADMIN`: Xóa sản phẩm.

### 🔗 Danh sách API
- `GET /api/v1/products`: Danh sách sản phẩm (có tìm kiếm & lọc danh mục).
- `GET /api/v1/products/low-stock`: Danh sách sản phẩm đang chạm/dưới ngưỡng tồn tối thiểu.
- `GET /api/v1/products/:id`: Chi tiết sản phẩm.
- `POST /api/v1/products`: Thêm mới sản phẩm.
- `PUT /api/v1/products/:id`: Cập nhật sản phẩm.
- `DELETE /api/v1/products/:id`: Xóa sản phẩm.

---

## 6. Tính Năng Quản Lý Phiếu Nhập / Xuất Kho (Movements & Inventory SOP)

### 🎯 Mục đích
Thực hiện quy trình tạo, kiểm tra, duyệt và theo dõi các giao dịch Nhập hàng (Inbound) và Xuất hàng (Outbound).

### 📜 Quy tắc nghiệp vụ & Validation
- **Mã phiếu tự động**: `PN-YYYYMMDD-XXXX` cho Nhập kho, `PX-YYYYMMDD-XXXX` cho Xuất kho.
- **Ràng buộc kiểm tra tồn kho trước khi xuất**:
  - Khi lập hoặc duyệt phiếu `EXPORT`, hệ thống tự động kiểm tra `Product.quantity >= Item.requestedQuantity`.
  - Nếu không đủ số lượng, hệ thống lập tức chặn và trả về lỗi **HTTP 400 Bad Request** (`INSUFFICIENT_STOCK`).
- **Quy trình duyệt phiếu & Transaction SOP**:
  - Việc chuyển trạng thái sang `COMPLETED` bọc hoàn toàn trong Prisma Transaction:
    - Phiếu `IMPORT`: Tăng `Product.quantity`, tạo `StockMovementLog` với `quantityChange = +N`.
    - Phiếu `EXPORT`: Trừ `Product.quantity`, tạo `StockMovementLog` với `quantityChange = -N`.
- **Phân quyền RBAC**:
  - `ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`: Tạo phiếu đề xuất (`PENDING`).
  - `ADMIN`, `WAREHOUSE_MANAGER`: Duyệt phiếu (`COMPLETED` hoặc `CANCELLED`).

### 🔗 Danh sách API
- `GET /api/v1/movements`: Danh sách phiếu Nhập/Xuất kho (có lọc loại & trạng thái).
- `GET /api/v1/movements/:id`: Chi tiết phiếu Nhập/Xuất kho và hàng hóa đi kèm.
- `POST /api/v1/movements`: Tạo phiếu Nhập/Xuất kho mới (`PENDING`).
- `PATCH /api/v1/movements/:id/status`: Duyệt phiếu (`COMPLETED` hoặc `CANCELLED`).

---

## 7. Tính Năng Nhật Ký Biến Động Kho (Stock Movement Audit Logs)

### 🎯 Mục đích
Ghi lại chi tiết lịch sử mỗi lần biến động tồn kho (ai nhập/xuất, số lượng thay đổi bao nhiêu, tồn kho trước/sau khi thay đổi).

### 📜 Quy tắc nghiệp vụ & Validation
- Nhật ký là bản ghi không thể sửa xóa (Immutable Audit Trail).
- Mỗi log lưu trữ: `productId`, `movementId`, `quantityChange`, `previousQuantity`, `newQuantity`, `refCode`, `tenantId`, `createdAt`.

### 🔗 Danh sách API
- `GET /api/v1/movements/logs/history`: Lấy lịch sử biến động tồn kho.

---

## 8. Tính Năng Quản Lý Thành Viên & Phân Quyền (User Administration)

### 🎯 Mục đích
Quản lý danh sách các tài khoản nhân viên trong cùng Kho/Cửa hàng và nâng/hạ vai trò sử dụng (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`).

### 📜 Quy tắc nghiệp vụ & Validation
- Phân quyền: **Chỉ duy nhất `ADMIN` mới được phép sử dụng**.
- Admin chỉ được quyền xem và đổi vai trò của thành viên thuộc cùng Kho/Cửa hàng (`tenantId`).

### 🔗 Danh sách API
- `GET /api/v1/users`: Danh sách nhân viên trong kho hàng.
- `PATCH /api/v1/users/:id/role`: Cập nhật vai trò nhân viên.
