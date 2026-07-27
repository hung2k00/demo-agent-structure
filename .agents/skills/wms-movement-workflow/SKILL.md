---
name: wms-movement-workflow
description: Hướng dẫn nghiệp vụ và kỹ thuật xử lý Nhập/Xuất kho (SOP), Kiểm tra tồn kho trước khi xuất, Prisma Transaction & Audit Log.
---

# WMS Movement Workflow Skill

Skill này cung cấp các nguyên tắc cốt lõi khi làm việc với Luồng Xuất/Nhập hàng hóa và Nhật ký Biến động kho.

## 1. Nguyên Tắc An Toàn Tồn Kho (Outbound Safety)
Khi tạo hoặc duyệt phiếu Xuất (`EXPORT`), hệ thống bắt buộc kiểm tra khả năng đáp ứng của tồn kho trước:
```typescript
if (type === MovementType.EXPORT && product.quantity < item.quantity) {
  throw new BadRequestException(`INSUFFICIENT_STOCK: Sản phẩm ${product.name} không đủ để xuất`);
}
```

## 2. Prisma Database Transaction SOP
Khi chuyển trạng thái sang `COMPLETED`, bắt buộc phải bọc trong transaction để tránh lỗi lệch dữ liệu (Data Inconsistency):
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Cập nhật số lượng sản phẩm
  await tx.product.update({ ... });
  // 2. Ghi nhật ký biến động kho
  await tx.stockMovementLog.create({ ... });
  // 3. Cập nhật trạng thái phiếu
  return tx.warehouseMovement.update({ ... });
});
```

## 3. Quy Chuẩn Sinh Mã Phiếu
- Nhập kho: `PN-YYYYMMDD-XXXX`
- Xuất kho: `PX-YYYYMMDD-XXXX`
