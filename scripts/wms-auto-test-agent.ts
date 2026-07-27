import { spawn, ChildProcess } from 'child_process';
import http from 'http';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const API_BASE = 'http://localhost:3002/api/v1';

class WMSAutoTestAgent {
  private results: TestResult[] = [];
  private serverProcess: ChildProcess | null = null;
  private adminToken: string = '';
  private staffToken: string = '';
  private tenantId: string = '';
  private supplierId: string = '';
  private productId: string = '';
  private importMovementId: string = '';
  private staffUserId: string = '';

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

  private async recordTest(suite: string, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({ suite, name, passed: true, message: 'OK', durationMs });
      console.log(`  \x1b[32m✔ PASS\x1b[0m [${durationMs}ms] ${suite} -> ${name}`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const message = err?.message || String(err);
      this.results.push({ suite, name, passed: false, message, durationMs });
      console.log(`  \x1b[31m✖ FAIL\x1b[0m [${durationMs}ms] ${suite} -> ${name}`);
      console.log(`     \x1b[33mReason: ${message}\x1b[0m`);
    }
  }

  private async ensureServerRunning(): Promise<void> {
    try {
      const res = await this.request('GET', '/auth/tenants');
      if (res.status === 200) {
        console.log('⚡ Detected NestJS API running on http://localhost:3002/api/v1');
        return;
      }
    } catch (e) {
      // Server not running, start it
    }

    console.log('🚀 Starting NestJS API server for test agent execution...');
    this.serverProcess = spawn('node', ['dist/src/main.js'], {
      cwd: '/Users/tranhung/Documents/demoo/apps/api',
      stdio: 'inherit',
      shell: true,
    });

    // Wait for server ready
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await this.request('GET', '/auth/tenants');
        if (res.status === 200) {
          console.log('✅ Server successfully initialized!');
          return;
        }
      } catch (e) {
        // Retry
      }
    }
    throw new Error('Could not start NestJS API server on port 3002');
  }

  async runAllSuites() {
    console.log('\n======================================================');
    console.log('🤖 SMARTWMS AUTOMATED AGENT TEST SUITE RUNNER');
    console.log('======================================================\n');

    await this.ensureServerRunning();

    const timestamp = Date.now();

    // ---------------------------------------------------------
    // SUITE 1: Auth & Multi-Tenant Management
    // ---------------------------------------------------------
    console.log('\n📦 SUITE 1: Auth & Multi-Tenant Management');

    await this.recordTest('Auth', 'Get public tenants list', async () => {
      const res = await this.request('GET', '/auth/tenants');
      if (res.status !== 200 || !Array.isArray(res.data)) {
        throw new Error(`Expected 200 OK array, got status ${res.status}`);
      }
    });

    await this.recordTest('Auth', 'Register Admin with New Tenant (Role ADMIN)', async () => {
      const res = await this.request('POST', '/auth/register', {
        fullName: 'Agent Admin',
        email: `agent_admin_${timestamp}@smartwms.com`,
        password: 'Password123!',
        companyName: `Kho Agent Auto ${timestamp}`,
      });

      if (res.status !== 201 || !res.data.accessToken || res.data.user?.role !== 'ADMIN') {
        throw new Error(`Registration failed or role != ADMIN: ${JSON.stringify(res.data)}`);
      }

      this.adminToken = res.data.accessToken;
      this.tenantId = res.data.user.tenantId;
    });

    await this.recordTest('Auth', 'Register Staff with Existing Tenant (Role STAFF)', async () => {
      const res = await this.request('POST', '/auth/register', {
        fullName: 'Agent Staff',
        email: `agent_staff_${timestamp}@smartwms.com`,
        password: 'Password123!',
        tenantId: this.tenantId,
      });

      if (res.status !== 201 || !res.data.accessToken || res.data.user?.role !== 'STAFF') {
        throw new Error(`Staff registration failed or role != STAFF: ${JSON.stringify(res.data)}`);
      }

      this.staffToken = res.data.accessToken;
      this.staffUserId = res.data.user.id;
    });

    await this.recordTest('Auth', 'Check Email Uniqueness (HTTP 409 Conflict)', async () => {
      const res = await this.request('POST', '/auth/register', {
        fullName: 'Duplicate Check',
        email: `agent_admin_${timestamp}@smartwms.com`,
        password: 'Password123!',
        companyName: 'Some Store',
      });

      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict, got ${res.status}`);
      }
    });

    await this.recordTest('Auth', 'Verify User Profile (JWT Authentication)', async () => {
      const res = await this.request('GET', '/auth/profile', null, this.adminToken);
      if (res.status !== 200 || res.data.tenantId !== this.tenantId) {
        throw new Error(`Invalid profile response: ${JSON.stringify(res.data)}`);
      }
    });

    // ---------------------------------------------------------
    // SUITE 2: Supplier Management
    // ---------------------------------------------------------
    console.log('\n🚚 SUITE 2: Supplier Management');

    await this.recordTest('Supplier', 'Admin creates new supplier (SUP-AGENT-01)', async () => {
      const res = await this.request('POST', '/suppliers', {
        code: 'SUP-AGENT-01',
        name: 'Nhà Cung Cấp Tự Động 1',
        email: 'supplier1@agent.com',
        phone: '0988776655',
      }, this.adminToken);

      if (res.status !== 201 || !res.data.id || res.data.code !== 'SUP-AGENT-01') {
        throw new Error(`Failed to create supplier: ${JSON.stringify(res.data)}`);
      }

      this.supplierId = res.data.id;
    });

    await this.recordTest('Supplier', 'Check unique supplier code per tenant rejection', async () => {
      const res = await this.request('POST', '/suppliers', {
        code: 'SUP-AGENT-01',
        name: 'Duplicate Supplier Code',
      }, this.adminToken);

      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict for duplicate code, got ${res.status}`);
      }
    });

    await this.recordTest('Supplier', 'Staff deletes supplier -> Rejected (HTTP 403 Forbidden)', async () => {
      const res = await this.request('DELETE', `/suppliers/${this.supplierId}`, null, this.staffToken);
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for Staff deletion, got ${res.status}`);
      }
    });

    // ---------------------------------------------------------
    // SUITE 3: Product & Inventory Management
    // ---------------------------------------------------------
    console.log('\n📦 SUITE 3: Product & Inventory Management');

    await this.recordTest('Product', 'Admin creates product (SKU: LAP-AGENT-X1)', async () => {
      const res = await this.request('POST', '/products', {
        sku: 'LAP-AGENT-X1',
        name: 'Laptop Agent Test Pro',
        category: 'Electronics',
        unit: 'Cái',
        minQuantity: 5,
        price: 25000000,
      }, this.adminToken);

      if (res.status !== 201 || !res.data.id || res.data.quantity !== 0 || !res.data.isLowStock) {
        throw new Error(`Product creation failed or isLowStock flag incorrect: ${JSON.stringify(res.data)}`);
      }

      this.productId = res.data.id;
    });

    await this.recordTest('Product', 'Invalid SKU format rejection (lowercase/spaces)', async () => {
      const res = await this.request('POST', '/products', {
        sku: 'invalid sku 123',
        name: 'Invalid SKU Product',
        category: 'Test',
        unit: 'Cái',
        price: 100,
      }, this.adminToken);

      if (res.status !== 400) {
        throw new Error(`Expected 400 Bad Request for invalid SKU regex, got ${res.status}`);
      }
    });

    await this.recordTest('Product', 'Query Low Stock Products List', async () => {
      const res = await this.request('GET', '/products/low-stock', null, this.staffToken);
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
        throw new Error(`Low stock query failed: ${JSON.stringify(res.data)}`);
      }
    });

    // ---------------------------------------------------------
    // SUITE 4: Movements & Inventory Audit Logs (WMS SOP)
    // ---------------------------------------------------------
    console.log('\n📝 SUITE 4: Warehouse Movement SOP & Stock Audit Logs');

    await this.recordTest('Movement', 'Create Import Receipt (Status PENDING)', async () => {
      const res = await this.request('POST', '/movements', {
        type: 'IMPORT',
        supplierId: this.supplierId,
        note: 'Nhập hàng đợt test tự động',
        items: [{ productId: this.productId, quantity: 15, price: 25000000 }],
      }, this.staffToken);

      if (res.status !== 201 || res.data.status !== 'PENDING' || !res.data.code.startsWith('PN-')) {
        throw new Error(`Import creation failed or code prefix invalid: ${JSON.stringify(res.data)}`);
      }

      this.importMovementId = res.data.id;
    });

    await this.recordTest('Movement', 'Verify product quantity remains 0 while PENDING', async () => {
      const res = await this.request('GET', `/products/${this.productId}`, null, this.staffToken);
      if (res.status !== 200 || res.data.quantity !== 0) {
        throw new Error(`Stock updated prematurely while PENDING: qty = ${res.data.quantity}`);
      }
    });

    await this.recordTest('Movement', 'Staff attempts to approve receipt -> Rejected (HTTP 403 Forbidden)', async () => {
      const res = await this.request('PATCH', `/movements/${this.importMovementId}/status`, { status: 'COMPLETED' }, this.staffToken);
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for Staff status approval, got ${res.status}`);
      }
    });

    await this.recordTest('Movement', 'Admin approves Import receipt -> COMPLETED & Stock Incremented (+15)', async () => {
      const res = await this.request('PATCH', `/movements/${this.importMovementId}/status`, { status: 'COMPLETED' }, this.adminToken);
      if (res.status !== 200 || res.data.status !== 'COMPLETED') {
        throw new Error(`Approval failed: ${JSON.stringify(res.data)}`);
      }

      // Check stock updated to 15
      const prodRes = await this.request('GET', `/products/${this.productId}`, null, this.adminToken);
      if (prodRes.data.quantity !== 15) {
        throw new Error(`Stock quantity expected 15 after import, got ${prodRes.data.quantity}`);
      }
    });

    await this.recordTest('Movement', 'Export overstock check -> Rejection (HTTP 400 INSUFFICIENT_STOCK)', async () => {
      const res = await this.request('POST', '/movements', {
        type: 'EXPORT',
        note: 'Xuất hàng vượt tồn',
        items: [{ productId: this.productId, quantity: 30, price: 30000000 }],
      }, this.adminToken);

      if (res.status !== 400 || !res.data.message?.includes('INSUFFICIENT_STOCK')) {
        throw new Error(`Expected 400 Bad Request INSUFFICIENT_STOCK, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
    });

    await this.recordTest('Movement', 'Valid Export (Qty 5) -> COMPLETED & Stock Decremented (15 -> 10)', async () => {
      const createRes = await this.request('POST', '/movements', {
        type: 'EXPORT',
        note: 'Xuất hàng bán hợp lệ',
        items: [{ productId: this.productId, quantity: 5, price: 30000000 }],
      }, this.adminToken);

      const exportId = createRes.data.id;
      const approveRes = await this.request('PATCH', `/movements/${exportId}/status`, { status: 'COMPLETED' }, this.adminToken);
      if (approveRes.status !== 200) {
        throw new Error(`Export approval failed: ${JSON.stringify(approveRes.data)}`);
      }

      const prodRes = await this.request('GET', `/products/${this.productId}`, null, this.adminToken);
      if (prodRes.data.quantity !== 10) {
        throw new Error(`Stock quantity expected 10 after export, got ${prodRes.data.quantity}`);
      }
    });

    await this.recordTest('Audit Log', 'Fetch Stock Movement Logs Audit Trail History', async () => {
      const res = await this.request('GET', '/movements/logs/history', null, this.adminToken);
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length < 2) {
        throw new Error(`Audit logs incomplete or invalid: ${JSON.stringify(res.data)}`);
      }
    });

    // ---------------------------------------------------------
    // SUITE 5: Dashboard Analytics
    // ---------------------------------------------------------
    console.log('\n📊 SUITE 5: Dashboard Analytics');

    await this.recordTest('Dashboard', 'Fetch real-time stats KPI indicators', async () => {
      const res = await this.request('GET', '/dashboard/stats', null, this.adminToken);
      if (res.status !== 200 || res.data.totalProducts < 1 || res.data.totalStockQuantity !== 10) {
        throw new Error(`Dashboard stats mismatch: ${JSON.stringify(res.data)}`);
      }
    });

    // ---------------------------------------------------------
    // SUITE 6: User Administration
    // ---------------------------------------------------------
    console.log('\n👥 SUITE 6: User Administration');

    await this.recordTest('User Admin', 'Admin lists users in tenant', async () => {
      const res = await this.request('GET', '/users', null, this.adminToken);
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length < 2) {
        throw new Error(`User list query failed: ${JSON.stringify(res.data)}`);
      }
    });

    await this.recordTest('User Admin', 'Admin promotes Staff role -> WAREHOUSE_MANAGER', async () => {
      const res = await this.request('PATCH', `/users/${this.staffUserId}/role`, { role: 'WAREHOUSE_MANAGER' }, this.adminToken);
      if (res.status !== 200 || res.data.role !== 'WAREHOUSE_MANAGER') {
        throw new Error(`Role update failed: ${JSON.stringify(res.data)}`);
      }
    });

    // Clean up server process if spawned by script
    if (this.serverProcess) {
      this.serverProcess.kill();
    }

    // PRINT SUMMARY
    console.log('\n======================================================');
    console.log('📊 AUTOMATED TEST AGENT EXECUTION REPORT SUMMARY');
    console.log('======================================================');
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log(`  Total Tests Run: ${total}`);
    console.log(`  \x1b[32mPassed: ${passed}\x1b[0m`);
    console.log(`  \x1b[${failed > 0 ? '31' : '32'}mFailed: ${failed}\x1b[0m`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

const runner = new WMSAutoTestAgent();
runner.runAllSuites().catch((err) => {
  console.error('Fatal agent error:', err);
  process.exit(1);
});
