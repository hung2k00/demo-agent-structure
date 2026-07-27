---
name: wms-dashboard-analytics
description: Hướng dẫn phát triển Bảng điều khiển & Thống kê dữ liệu tồn kho real-time cho SmartWMS.
---

# WMS Dashboard Analytics Skill

Skill này hướng dẫn quy trình tính toán các chỉ số thống kê tài chính và vận hành kho hàng.

## 1. Các Chỉ Số Thống Kê Cốt Lõi
- **Tổng số lượng sản phẩm (`totalProducts`)**: `products.length`
- **Tổng số lượng tồn kho (`totalStockQuantity`)**: `SUM(product.quantity)`
- **Tổng giá trị kho hàng (`totalStockValue`)**: `SUM(product.quantity * product.price)`
- **Số phiếu chờ duyệt (`pendingMovementsCount`)**: `count({ where: { status: 'PENDING' } })`
- **Số cảnh báo tồn thấp (`lowStockAlertsCount`)**: `count({ where: { quantity <= minQuantity } })`

## 2. API Endpoint & DTO
- Endpoint: `GET /api/v1/dashboard/stats`
- Response DTO: `DashboardStatsDto` trong `packages/shared-types`.
