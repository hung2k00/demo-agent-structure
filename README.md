# 📦 SmartWMS Pro - Hệ Thống Quản Lý Kho Hàng Doanh Nghiệp

[![Monorepo](https://img.shields.io/badge/Monorepo-pnpm-blue.svg)](https://pnpm.io/)
[![Backend](https://img.shields.io/badge/Backend-NestJS-red.svg)](https://nestjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vue%203-brightgreen.svg)](https://vuejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2015-blue.svg)](https://www.postgresql.org/)
[![ORM](https://img.shields.io/badge/ORM-Prisma%207-indigo.svg)](https://www.prisma.io/)
[![AI Agent](https://img.shields.io/badge/AI%20Agent-Architecture-purple.svg)](./AGENTS.md)

**SmartWMS Pro** là hệ thống quản lý xuất nhập hàng hóa và tồn kho kho hàng đa doanh nghiệp (Multi-Tenant Warehouse Management System). Dự án được thiết kế chuẩn mực theo mô hình **Monorepo** kết hợp với **Kiến trúc AI Agent Decoupled Architecture (`.agents/`)**, cho phép phát triển nhanh chóng, tự động hóa kiểm thử và tối ưu Token khi tương tác với các trợ lý AI.

---

## ✨ Tính Năng Nổi Bật

- 🏢 **Multi-Tenancy & Auth**: Đăng ký tài khoản chọn Kho có sẵn (`STAFF`) hoặc khởi tạo Kho mới (`ADMIN`). Xác thực JWT Token & Bcrypt Password Hashing.
- 👥 **Phân Quyền RBAC 3 Cấp**: Phân quyền chi tiết theo các vai trò Quản trị viên (`ADMIN`), Quản lý kho (`WAREHOUSE_MANAGER`) và Nhân viên kho (`STAFF`).
- 🏷️ **Quản Lý Danh Mục (Category)**: Quản lý danh mục sản phẩm với mã `CAT-` duy nhất theo Tenant, hỗ trợ lọc danh sách sản phẩm theo danh mục.
- 🚚 **Quản Lý Nhà Cung Cấp (Supplier)**: Quản lý thông tin đối tác cung ứng với mã `SUP-` duy nhất theo Tenant.
- 📦 **Quản Lý Sản Phẩm & Tồn Kho**: Theo dõi số lượng tồn kho real-time, mã SKU tiêu chuẩn, ngưỡng tồn tối thiểu và tự động phát cờ cảnh báo `⚠️ Tồn kho thấp`.
- 📝 **Phiếu Nhập / Xuất Kho (SOP Workflow)**:
  - Tự động tạo mã phiếu `PN-YYYYMMDD-XXXX` (Nhập kho) và `PX-YYYYMMDD-XXXX` (Xuất kho).
  - Kiểm tra số lượng tồn kho trước khi xuất (`INSUFFICIENT_STOCK`).
  - **Prisma Transaction**: Duyệt phiếu `COMPLETED` bọc hoàn toàn trong giao dịch CSDL, tự động cập nhật tồn kho và tạo nhật ký `StockMovementLog`.
- 📜 **Nhật Ký Biến Động Kho (Audit Log Trail)**: Lịch sử biến động tồn kho chi tiết không thể sửa xóa (Immutable).
- 📊 **Bảng Điều Khiển Real-time**: Thống kê tổng số mặt hàng, tổng tồn kho, giá trị quy đổi kho hàng và số phiếu chờ duyệt.
- 🎨 **Giao Diện Glassmorphism Cao Cấp**: Thiết kế **Left Sidebar Navigation** cho Laptop/Desktop và Top Drawer cho Điện thoại/iPad.
- 🤖 **Hệ Thống Agent Tự Động Hóa**: Agent kiểm thử tự động 100% E2E (`npm run test:agent`) và Agent bơm dữ liệu mẫu thực tế (`npm run seed:demo`).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Infrastructure & Architecture**
- **Monorepo Manager**: `pnpm` workspace
- **AI Agent Architecture**: `.agents/rules/`, `.agents/skills/`, `AGENTS.md`

### **Backend (`apps/api`)**
- **Framework**: NestJS (TypeScript)
- **Database & ORM**: PostgreSQL 15 + Prisma ORM v7 (`@prisma/adapter-pg`)
- **Security & Validation**: Passport JWT, Bcrypt, Class-Validator, Class-Transformer

### **Frontend (`apps/web`)**
- **Framework**: Vue 3 (Composition API `<script setup lang="ts">`)
- **Build Tool**: Vite
- **Styling**: TailwindCSS, Glassmorphism Aesthetics, Lucide Icons
- **State Management**: Pinia

### **Shared (`packages/shared-types`)**
- Shared TypeScript DTOs, Enums và Interfaces dùng chung giữa API và Web UI.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
demoo/
├── .agents/                    # Tầng điều khiển & Tri thức AI Agent
│   ├── rules/                  # Các quy tắc nghiệp vụ cố định (9 rules)
│   └── skills/                 # Các tập kỹ năng thao tác chuyên biệt (17 skills)
├── apps/                       # Monorepo Applications
│   ├── api/                    # NestJS Backend API Service
│   │   ├── prisma/             # Schema CSDL & Prisma Config (v7)
│   │   └── src/                # Modules: Auth, Users, Categories, Suppliers, Products, Movements, Dashboard
│   └── web/                    # Vue 3 Frontend Web App
│       └── src/                # App.vue (Left Sidebar UI), Views, Stores (Pinia)
├── packages/                   # Monorepo Shared Packages
│   └── shared-types/           # DTOs, Enums, Interfaces dùng chung 100%
├── scripts/                    # Autonomous Agent Tool Scripts
│   ├── wms-auto-test-agent.ts  # Agent kiểm thử tự động E2E (12/12 Test cases)
│   └── wms-demo-data-agent.ts  # Agent bơm dữ liệu mẫu thực tế vào PostgreSQL
├── AGENTS.md                   # File đăng ký chỉ thị trung tâm (Master Registry)
├── WMS_FEATURES_DOCUMENTATION.md # Tài liệu mô tả chi tiết 8.5 tính năng nghiệp vụ
├── PROJECT_STRUCTURE_EXPLANATION.md # Tài liệu giải thích chi tiết cấu trúc & tối ưu Token
├── docker-compose.yml          # File khởi chạy nhanh PostgreSQL 15 Container
├── package.json                # Cấu hình pnpm monorepo & lệnh chạy scripts
└── pnpm-workspace.yaml
```

> 📌 Chi tiết lý do thiết kế và phương pháp tối ưu Token xem tại [PROJECT_STRUCTURE_EXPLANATION.md](./PROJECT_STRUCTURE_EXPLANATION.md).

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 📋 1. Yêu Cầu Hệ Thống
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0` (Cài đặt: `npm i -g pnpm`)
- **PostgreSQL**: `v15` (hoặc sử dụng Docker)

---

### 📥 2. Cài Đặt Dependencies
Mở terminal tại thư mục gốc dự án và chạy:
```bash
pnpm install
```

---

### 🛢️ 3. Khởi Tạo Cơ Sở Dữ Liệu PostgreSQL

#### **Cách 1: Sử dụng Docker (Khuyên dùng)**
```bash
docker-compose up -d
```

#### **Cách 2: Sử dụng PostgreSQL cài cục bộ (Homebrew / Windows Service)**
Đảm bảo PostgreSQL đang chạy trên cổng `5432` với Database name: `smartwms_db`.

---

### ⚙️ 4. Cấu Hình Môi Trường (.env)
Kiểm tra file `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartwms_db?schema=public"
JWT_SECRET="smartwms_secret_key_2026"
PORT=3002
```

---

### 🔄 5. Đồng Bộ CSDL & Tạo Prisma Client
Chạy lệnh đẩy Schema vào PostgreSQL và sinh Prisma Client v7:
```bash
cd apps/api
npx prisma db push
npx prisma generate
cd ../..
```

---

### 💻 6. Khởi Chạy Ứng Dụng (Development Mode)

#### **Khởi chạy Backend NestJS API (`http://localhost:3002/api/v1`):**
```bash
npm run dev:api
```

#### **Khởi chạy Frontend Vue 3 Web (`http://localhost:3001`):**
Mở thêm 1 terminal mới và chạy:
```bash
npm run dev:web
```

Truy cập giao diện Web tại địa chỉ: **`http://localhost:3001`**

---

## 🤖 Hệ Thống Agent Script Tự Động Hóa

Dự án cung cấp 2 công cụ Agent chạy qua dòng lệnh giúp tự động hóa kiểm thử và nạp dữ liệu mẫu:

### 1. Bơm Dữ Liệu Mẫu Thực Tế (Demo Seeder Agent)
Chạy lệnh sau để tự động tạo Kho hàng mẫu, 3 Tài khoản người dùng, 4 Danh mục, 4 Nhà cung cấp, 7 Sản phẩm và các Phiếu kho:
```bash
npm run seed:demo
```

### 2. Kiểm Thử Tự Động 100% E2E (Automated Test Agent)
Chạy lệnh kiểm thử toàn bộ hệ thống (12 test cases E2E về Auth, Category, Supplier, Product Regex, Export Guard, Transaction SOP & RBAC):
```bash
npm run test:agent
```

---

## 🔑 Thông Tin Tài Khoản Mẫu (Sau khi chạy `seed:demo`)

| Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
|---|---|---|---|
| **Quản Trị Viên (ADMIN)** | `admin@smartwms.com` | `Password123!` | Toàn quyền quản trị kho, thành viên & hệ thống |
| **Quản Lý Kho (MANAGER)** | `manager@smartwms.com` | `Password123!` | Quản lý sản phẩm, danh mục, NCC & duyệt phiếu |
| **Nhân Viên Kho (STAFF)** | `staff@smartwms.com` | `Password123!` | Xem danh sách, tạo phiếu đề xuất `PENDING` |

---

## 📚 Tài Liệu Tham Khảo Chi Tiết

- 📑 [WMS_FEATURES_DOCUMENTATION.md](./WMS_FEATURES_DOCUMENTATION.md): Tài liệu mô tả chi tiết 8.5 tính năng nghiệp vụ & danh sách API.
- 📐 [PROJECT_STRUCTURE_EXPLANATION.md](./PROJECT_STRUCTURE_EXPLANATION.md): Giải thích chi tiết cấu trúc thư mục & phương pháp tối ưu Token cho AI Agent.
- 📜 [AGENTS.md](./AGENTS.md): Bản đăng ký quy tắc & kỹ năng cho AI Agent.
