---
name: design-taste-frontend
description: Quy tắc thiết kế UI/UX hiện đại, Glassmorphism, TailwindCSS & Vue 3 Composition API cho hệ thống Quản lý Xuất Nhập Hàng Hóa.
---

# Hướng Dẫn Thiết Kế Giao Diện Frontend (design-taste-frontend)

Tài liệu này định nghĩa các tiêu chuẩn thiết kế và cách viết code CSS/TailwindCSS để tạo ra giao diện tối giản, hiện đại và sang trọng (Premium UI) cho ứng dụng Quản Lý Xuất Nhập Hàng Hóa.

## 1. Nguyên Tắc Thiết Kế CSS & TailwindCSS
- **Bảng màu Tailwind/HSL**:
  - Deep Slate / Neutral dark background: `bg-slate-900`, `bg-slate-950`.
  - Accent Primary: Indigo/Blue (`from-indigo-500 to-blue-600`).
  - Trạng thái Nhập hàng (Import): Green / Emerald (`text-emerald-400`, `bg-emerald-500/10`).
  - Trạng thái Xuất hàng (Export): Amber / Blue (`text-blue-400`, `bg-blue-500/10`).
- **Glassmorphic Cards**: `backdrop-blur-md bg-white/5 border border-white/10 shadow-xl`.
- **Micro-animations**: Hover mượt `transition-all duration-300 ease-in-out hover:-translate-y-0.5`.

## 2. Tiêu Chuẩn Cho Component Vue 3
- Độc lập, Reusable trong `apps/web/src/components`.
- Luôn dùng `<script setup lang="ts">`.
- Phân tách rõ ràng Props, Emits, Composables và UI state.
