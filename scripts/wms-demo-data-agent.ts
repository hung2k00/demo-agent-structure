import { spawn, ChildProcess } from 'child_process';
import http from 'http';

const API_BASE = 'http://localhost:3002/api/v1';

class WMSDemoDataAgent {
  private serverProcess: ChildProcess | null = null;

  private async request(method: string, path: string, body?: any, token?: string): Promise<{ status: number; data: any }> {
    const url = new URL(`${API_BASE}${path}`);
    const payload = body ? JSON.stringify(body) : null;

    return new Promise((resolve, reject) => {
      const req = http.request(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode || 500, data: parsed });
            } catch (err) {
              resolve({ status: res.statusCode || 500, data });
            }
          });
        },
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  private async ensureServerRunning(): Promise<void> {
    try {
      const res = await this.request('GET', '/auth/tenants');
      if (res.status === 200) {
        console.log('⚡ API server is running on http://localhost:3002/api/v1');
        return;
      }
    } catch (e) {
      // Server not running
    }

    console.log('🚀 Starting NestJS API server for demo data generation...');
    this.serverProcess = spawn('node', ['dist/src/main.js'], {
      cwd: '/Users/tranhung/Documents/demoo/apps/api',
      stdio: 'inherit',
      shell: true,
    });

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await this.request('GET', '/auth/tenants');
        if (res.status === 200) {
          console.log('✅ API server ready!');
          return;
        }
      } catch (e) {}
    }
    throw new Error('Could not reach API server');
  }

  async seedDemoData() {
    console.log('\n======================================================');
    console.log('🌱 SMARTWMS DEMO DATA GENERATION AGENT');
    console.log('======================================================\n');

    await this.ensureServerRunning();

    // Step 1: Register Main Tenant & Admin User
    console.log('1. Khởi tạo Kho Hàng & Tài Khoản Admin...');
    const adminEmail = 'admin@smartwms.com';
    const password = 'Password123!';

    let adminToken = '';
    let tenantId = '';

    const regRes = await this.request('POST', '/auth/register', {
      fullName: 'Trần Văn Quản Trị',
      email: adminEmail,
      password: password,
      companyName: 'Kho Hàng Tổng LogiTech Việt Nam',
    });

    if (regRes.status === 201) {
      adminToken = regRes.data.accessToken;
      tenantId = regRes.data.user.tenantId;
      console.log(`  ✓ Đã đăng ký thành công Kho hàng: "${regRes.data.user.tenantName}" (ID: ${tenantId})`);
    } else {
      const loginRes = await this.request('POST', '/auth/login', {
        email: adminEmail,
        password: password,
      });
      if (loginRes.status === 200) {
        adminToken = loginRes.data.accessToken;
        tenantId = loginRes.data.user.tenantId;
        console.log(`  ✓ Đã đăng nhập tài khoản Admin: ${adminEmail}`);
      } else {
        throw new Error(`Cannot register or login admin: ${JSON.stringify(loginRes.data)}`);
      }
    }

    // Step 2: Create Warehouse Manager & Staff Accounts
    console.log('\n2. Khởi tạo các tài khoản Nhân Viên & Quản Lý...');
    const managerEmail = 'manager@smartwms.com';
    const staffEmail = 'staff@smartwms.com';

    const mgrReg = await this.request('POST', '/auth/register', {
      fullName: 'Nguyễn Thị Quản Lý',
      email: managerEmail,
      password: password,
      tenantId,
    });
    if (mgrReg.status === 201) {
      await this.request('PATCH', `/users/${mgrReg.data.user.id}/role`, { role: 'WAREHOUSE_MANAGER' }, adminToken);
      console.log(`  ✓ Đã tạo tài khoản Quản Lý Kho: ${managerEmail} (Role: WAREHOUSE_MANAGER)`);
    }

    const staffReg = await this.request('POST', '/auth/register', {
      fullName: 'Lê Hoàng Nhân Viên',
      email: staffEmail,
      password: password,
      tenantId,
    });
    if (staffReg.status === 201) {
      console.log(`  ✓ Đã tạo tài khoản Nhân Viên Kho: ${staffEmail} (Role: STAFF)`);
    }

    // Step 2.5: Create Categories
    console.log('\n2.5. Khởi tạo Danh Mục Sản Phẩm...');
    const demoCategories = [
      { code: 'CAT-MAYTINH', name: 'Máy Tính & Laptop', description: 'Các loại máy tính xách tay và máy trạm' },
      { code: 'CAT-MANHINH', name: 'Màn Hình Hiển Thị', description: 'Màn hình máy tính 2K, 4K sắc nét' },
      { code: 'CAT-PHUKIEN', name: 'Phụ Kiện & Bàn Phím', description: 'Bàn phím cơ, chuột không dây và linh kiện' },
      { code: 'CAT-DIENTHOAI', name: 'Điện Thoại & Máy Tính Bảng', description: 'Smartphones và tablets cao cấp' },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of demoCategories) {
      const res = await this.request('POST', '/categories', cat, adminToken);
      if (res.status === 201) {
        categoryMap[cat.code] = res.data.id;
        console.log(`  ✓ Đã tạo Danh Mục: [${cat.code}] ${cat.name}`);
      } else {
        const listRes = await this.request('GET', '/categories', null, adminToken);
        const existing = listRes.data.find((c: any) => c.code === cat.code);
        if (existing) categoryMap[cat.code] = existing.id;
      }
    }

    // Step 3: Create Suppliers
    console.log('\n3. Tạo danh sách Nhà Cung Cấp...');
    const demoSuppliers = [
      { code: 'SUP-DELL', name: 'Công Ty TNHH Dell Global Việt Nam', email: 'contact@dell.com.vn', phone: '02838221100', address: 'Quận 1, TP. Hồ Chí Minh' },
      { code: 'SUP-SAMSUNG', name: 'Tập Đoàn Samsung Electronics Việt Nam', email: 'sales@samsung.com.vn', phone: '02439742200', address: 'KCN Yên Phong, Bắc Ninh' },
      { code: 'SUP-APPLE', name: 'Apple Distribution Vietnam Ltd', email: 'dist@apple.com', phone: '02839103300', address: 'Quận 3, TP. Hồ Chí Minh' },
      { code: 'SUP-LOGITECH', name: 'Nhà Phân Phối Logitech Việt Nam', email: 'support@logitech.vn', phone: '02838334455', address: 'Quận Tân Bình, TP. Hồ Chí Minh' },
    ];

    const supplierMap: Record<string, string> = {};

    for (const sup of demoSuppliers) {
      const res = await this.request('POST', '/suppliers', sup, adminToken);
      if (res.status === 201) {
        supplierMap[sup.code] = res.data.id;
        console.log(`  ✓ Đã tạo Nhà Cung Cấp: [${sup.code}] ${sup.name}`);
      } else {
        const listRes = await this.request('GET', '/suppliers', null, adminToken);
        const existing = listRes.data.find((s: any) => s.code === sup.code);
        if (existing) supplierMap[sup.code] = existing.id;
      }
    }

    // Step 4: Create Products with Linked Category ID
    console.log('\n4. Tạo danh mục Sản Phẩm Kho...');
    const demoProducts = [
      { sku: 'LAP-DELL-XPS15', name: 'Laptop Dell XPS 15 (i7/16GB/512GB)', categoryCode: 'CAT-MAYTINH', unit: 'Cái', price: 42500000, minQuantity: 5 },
      { sku: 'MACBOOK-PRO-16', name: 'MacBook Pro 16 inch M3 Max', categoryCode: 'CAT-MAYTINH', unit: 'Cái', price: 79900000, minQuantity: 3 },
      { sku: 'MON-LG-274K', name: 'Màn Hình LG UltraFine 27" 4K IPS', categoryCode: 'CAT-MANHINH', unit: 'Cái', price: 12800000, minQuantity: 8 },
      { sku: 'KB-LOGI-MXKEYS', name: 'Bàn Phím Cơ Logitech MX Keys S', categoryCode: 'CAT-PHUKIEN', unit: 'Cái', price: 3250000, minQuantity: 10 },
      { sku: 'MOU-LOGI-MXM3', name: 'Chuột Không Dây Logitech MX Master 3S', categoryCode: 'CAT-PHUKIEN', unit: 'Cái', price: 2850000, minQuantity: 10 },
      { sku: 'PHONE-SS-S24U', name: 'Điện Thoại Samsung Galaxy S24 Ultra', categoryCode: 'CAT-DIENTHOAI', unit: 'Cái', price: 31990000, minQuantity: 5 },
      { sku: 'TAB-APPLE-M4', name: 'Máy Tính Bảng iPad Pro 11" M4 Chip', categoryCode: 'CAT-DIENTHOAI', unit: 'Cái', price: 28500000, minQuantity: 4 },
    ];

    const productMap: Record<string, string> = {};

    for (const prod of demoProducts) {
      const categoryId = categoryMap[prod.categoryCode];
      const res = await this.request('POST', '/products', {
        sku: prod.sku,
        name: prod.name,
        categoryId,
        unit: prod.unit,
        price: prod.price,
        minQuantity: prod.minQuantity,
      }, adminToken);

      if (res.status === 201) {
        productMap[prod.sku] = res.data.id;
        console.log(`  ✓ Đã tạo Sản Phẩm: [${prod.sku}] ${prod.name} (Danh mục: ${res.data.categoryObj?.name || prod.categoryCode})`);
      } else {
        const listRes = await this.request('GET', '/products', null, adminToken);
        const existing = listRes.data.find((p: any) => p.sku === prod.sku);
        if (existing) productMap[prod.sku] = existing.id;
      }
    }

    // Step 5: Create & Complete Import Receipts
    console.log('\n5. Khởi tạo các Phiếu Nhập Kho & Nhập Hàng Tồn Kho Real-time...');

    const importBatches = [
      {
        supplierCode: 'SUP-DELL',
        note: 'Nhập kho đợt 1 hàng máy tính Dell XPS 15',
        items: [{ sku: 'LAP-DELL-XPS15', quantity: 20, price: 42500000 }],
      },
      {
        supplierCode: 'SUP-APPLE',
        note: 'Nhập hàng lô MacBook Pro & iPad từ Apple Việt Nam',
        items: [
          { sku: 'MACBOOK-PRO-16', quantity: 10, price: 79900000 },
          { sku: 'TAB-APPLE-M4', quantity: 15, price: 28500000 },
        ],
      },
      {
        supplierCode: 'SUP-LOGITECH',
        note: 'Nhập kho linh kiện bàn phím & chuột Logitech',
        items: [
          { sku: 'KB-LOGI-MXKEYS', quantity: 40, price: 3250000 },
          { sku: 'MOU-LOGI-MXM3', quantity: 50, price: 2850000 },
        ],
      },
    ];

    for (const batch of importBatches) {
      const supplierId = supplierMap[batch.supplierCode];
      const items = batch.items.map((i) => ({
        productId: productMap[i.sku],
        quantity: i.quantity,
        price: i.price,
      }));

      const createRes = await this.request('POST', '/movements', {
        type: 'IMPORT',
        supplierId,
        note: batch.note,
        items,
      }, adminToken);

      if (createRes.status === 201) {
        const movement = createRes.data;
        await this.request('PATCH', `/movements/${movement.id}/status`, { status: 'COMPLETED' }, adminToken);
        console.log(`  ✓ Đã nhập kho thành công Phiếu Nhập: [${movement.code}] - Tổng tiền: ${movement.totalAmount.toLocaleString('vi-VN')} đ`);
      }
    }

    // Step 6: Create Export Receipts
    console.log('\n6. Khởi tạo các Phiếu Xuất Kho...');

    const expRes1 = await this.request('POST', '/movements', {
      type: 'EXPORT',
      note: 'Xuất bán lẻ cho Công ty Công Nghệ Khang An',
      items: [
        { productId: productMap['LAP-DELL-XPS15'], quantity: 5, price: 46000000 },
        { productId: productMap['KB-LOGI-MXKEYS'], quantity: 10, price: 3600000 },
      ],
    }, adminToken);

    if (expRes1.status === 201) {
      await this.request('PATCH', `/movements/${expRes1.data.id}/status`, { status: 'COMPLETED' }, adminToken);
      console.log(`  ✓ Đã hoàn tất Phiếu Xuất: [${expRes1.data.code}] - Xuất 5 Dell XPS 15 & 10 Bàn Phím`);
    }

    // Step 7: Fetch Dashboard Stats
    console.log('\n======================================================');
    console.log('📊 THỐNG KÊ KHO HÀNG SAU KHỦNG DỮ LIỆU DEMO (DASHBOARD STATS)');
    console.log('======================================================');

    const statsRes = await this.request('GET', '/dashboard/stats', null, adminToken);
    if (statsRes.status === 200) {
      const s = statsRes.data;
      console.log(`  • Tổng số mặt hàng trong kho : ${s.totalProducts} sản phẩm`);
      console.log(`  • Tổng lượng hàng tồn kho     : ${s.totalStockQuantity} đơn vị`);
      console.log(`  • Tổng giá trị quy đổi kho    : ${s.totalStockValue.toLocaleString('vi-VN')} VNĐ`);
      console.log(`  • Cảnh báo tồn kho thấp      : ${s.lowStockAlertsCount} sản phẩm`);
    }

    console.log('\n======================================================');
    console.log('🔑 THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP DEMO');
    console.log('======================================================');
    console.log(`  1. Quản Trị Viên (ADMIN)     : ${adminEmail} | Mật khẩu: ${password}`);
    console.log(`  2. Quản Lý Kho (MANAGER)     : ${managerEmail} | Mật khẩu: ${password}`);
    console.log(`  3. Nhân Viên Kho (STAFF)     : ${staffEmail} | Mật khẩu: ${password}`);
    console.log('======================================================\n');

    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

const agent = new WMSDemoDataAgent();
agent.seedDemoData().catch((err) => {
  console.error('Lỗi khi tạo dữ liệu demo:', err);
  process.exit(1);
});
