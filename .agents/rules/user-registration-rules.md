# Quy Tắc Đăng Ký Tài Khoản & Quản Lý Người Dùng (User Registration Rules)

Tài liệu này định nghĩa các quy tắc nghiệp vụ, tính hợp lệ dữ liệu và bảo mật bắt buộc đối với chức năng **Đăng ký Tài khoản (`/api/v1/auth/register`)** trong hệ thống Quản Lý Kho.

---

## 1. Quy Tắc Validation Dữ Liệu Đăng Ký (Request DTO Validation)

Khi người dùng gửi request đăng ký tài khoản (`RegisterDto`), hệ thống bắt buộc kiểm tra các trường dữ liệu sau bằng `class-validator`:

1. **Họ và Tên (`fullName`)**:
   - Bắt buộc nhập (`@IsNotEmpty()`).
   - Độ dài từ 2 đến 50 ký tự. Không chứa ký tự đặc biệt độc hại.

2. **Email (`email`)**:
   - Bắt buộc đúng định dạng email (`@IsEmail()`).
   - Phải tự động chuyển về dạng chữ thường (lowercase) trước khi lưu vào DB.
   - **Ràng buộc duy nhất (Uniqueness Check)**: Email không được trùng lặp trong toàn bộ hệ thống (`ConflictException - 409`).

3. **Mật khẩu (`password`)**:
   - Mật khẩu tối thiểu **8 ký tự**, tối đa **32 ký tự**.
   - Bắt buộc chứa ít nhất:
     - 1 chữ cái viết hoa (`A-Z`).
     - 1 chữ cái viết thường (`a-z`).
     - 1 chữ số (`0-9`).
     - 1 ký tự đặc biệt (`!@#$%^&*`).

4. **Tên Kho / Cửa Hàng (`companyName` / `tenantName` / `tenantId`)**:
   - Cho phép chọn kho/cửa hàng hiện có từ danh sách (`GET /api/v1/auth/tenants`) hoặc nhập tên kho/cửa hàng mới.
   - Nếu chọn kho/cửa hàng đã tồn tại: Hệ thống gán tài khoản vào `Tenant` tương ứng.
   - Nếu nhập tên kho/cửa hàng chưa có trong DB: Hệ thống tự động khởi tạo bản ghi `Tenant` mới.

---

## 2. Quy Tắc Mã Hoá & Bảo Mật Mật Khẩu (Password Hashing Security)

1. **Bcrypt Hashing**:
   - **TẬP TRUNG CHẶN**: Tuyệt đối không lưu mật khẩu ở dạng văn bản thô (Plain text).
   - Sử dụng thuật toán `bcrypt` với `saltRounds >= 10` để mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
2. **Loại bỏ Mật Khẩu khỏi Kết Quả Trả Về (Sanitization)**:
   - Dữ liệu trả về client sau khi đăng ký thành công **TUYỆT ĐỐI KHÔNG** chứa trường `password` hay `passwordHash`.

---

## 3. Quy Tắc Khởi Tạo Quyền & Multi-Tenancy Khi Đăng Ký (Tenant Selection & Initializer)

1. **API Danh Sách Cửa Hàng / Kho Hàng**:
   - Cung cấp endpoint public `GET /api/v1/auth/tenants` trả về danh sách kho/cửa hàng (`[{ id, name }]`) để giao diện hiển thị cho người dùng lựa chọn.

2. **Xử Lý Kho / Cửa Hàng Khi Đăng Ký**:
   - **Nếu Kho / Cửa hàng đã tồn tại** (truyền `tenantId` hoặc `companyName` trùng tên trong DB):
     - Gán tài khoản người dùng vào `Tenant` đó.
     - Vai trò mặc định: **`STAFF`** (Nhan viên) (trừ khi kho đó chưa có user nào thì nhận **`ADMIN`**).
   - **Nếu Kho / Cửa hàng chưa tồn tại** (nhập tên kho mới):
     - Hệ thống tự động tạo `Tenant` mới với tên vừa nhập.
     - Vai trò mặc định: **`ADMIN`** (Quản trị viên khởi tạo kho).

3. **Phát Hành JWT Token Ngay Sau Đăng Ký**:
   - Đăng ký thành công trả về `AccessToken` (thời hạn 15-60 phút) và `RefreshToken` (7-30 ngày) để tự động đăng nhập người dùng mà không cần bắt họ đăng nhập lại.

---

## 4. Xử Lý Lỗi & Mã Lỗi Chuẩn (HTTP Error Responses)

- **`400 Bad Request`**: Dữ liệu đầu vào không hợp lệ (sai định dạng email, mật khẩu quá yếu, thiếu họ tên).
- **`409 Conflict`**: Email đã được đăng ký trong hệ thống trước đó.
- **`201 Created`**: Đăng ký thành công, trả về thông tin `user`, `tenant` và cặp `tokens`.
