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
  private categoryId: string = '';
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
      // Server not running
    }

    console.log('🚀 Starting NestJS API server for test agent execution...');
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
          console.log('✅ Server successfully initialized!');
          return;
        }
      } catch (e) {}
    }
    throw new Error('Could not start NestJS API server on port 3002');
  }

  async runAllSuites() {
    console.log('\n======================================================');
    console.log('🤖 SMARTWMS AUTOMATED AGENT TEST SUITE RUNNER');
    console.log('======================================================\n');

    await this.ensureServerRunning();

    const timestamp = Date.now();

    // SUITE 1: Auth & Multi-Tenant Management
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

    // SUITE 1.5: Category Management
    console.log('\n🏷️ SUITE 1.5: Category Management');

    await this.recordTest('Category', 'Admin creates new Category (CAT-MAYTINH)', async () => {
      const res = await this.request('POST', '/categories', {
        code: 'CAT-MAYTINH',
        name: 'Máy Tính & Laptop',
        description: 'Danh mục các loại máy tính',
      }, this.adminToken);

      if (res.status !== 201 || !res.data.id || res.data.code !== 'CAT-MAYTINH') {
        throw new Error(`Category creation failed: ${JSON.stringify(res.data)}`);
      }

      this.categoryId = res.data.id;
    });

    await this.recordTest('Category', 'Check duplicate Category code rejection', async () => {
      const res = await this.request('POST', '/categories', {
        code: 'CAT-MAYTINH',
        name: 'Tên Khác',
      }, this.adminToken);

      if (res.status !== 409) {
        throw new Error(`Expected 409 Conflict for duplicate category code, got ${res.status}`);
      }
    });

    await this.recordTest('Category', 'Staff deletes Category -> Rejected (HTTP 403 Forbidden)', async () => {
      const res = await this.request('DELETE', `/categories/${this.categoryId}`, null, this.staffToken);
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for Staff category deletion, got ${res.status}`);
      }
    });

    // SUITE 2: Supplier Management
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

    // SUITE 3: Product & Inventory Management
    console.log('\n📦 SUITE 3: Product & Inventory Management');

    await this.recordTest('Product', 'Admin creates product linked to Category (SKU: LAP-AGENT-X1)', async () => {
      const res = await this.request('POST', '/products', {
        sku: 'LAP-AGENT-X1',
        name: 'Laptop Agent Test Pro',
        categoryId: this.categoryId,
        unit: 'Cái',
        minQuantity: 5,
        price: 25000000,
      }, this.adminToken);

      if (res.status !== 201 || !res.data.id || res.data.categoryId !== this.categoryId) {
        throw new Error(`Product creation failed or categoryId link missing: ${JSON.stringify(res.data)}`);
      }

      this.productId = res.data.id;
    });

    await this.recordTest('Product', 'Filter products list by Category ID', async () => {
      const res = await this.request('GET', `/products?categoryId=${this.categoryId}`, null, this.staffToken);
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
        throw new Error(`Filtering by categoryId failed: ${JSON.stringify(res.data)}`);
      }
    });

    // SUITE 4: Movements & SOP
    console.log('\n📝 SUITE 4: Warehouse Movement SOP & Stock Audit Logs');

    await this.recordTest('Movement', 'Create Import Receipt (Status PENDING)', async () => {
      const res = await this.request('POST', '/movements', {
        type: 'IMPORT',
        supplierId: this.supplierId,
        note: 'Nhập hàng đợt test tự động',
        items: [{ productId: this.productId, quantity: 15, price: 25000000 }],
      }, this.staffToken);

      if (res.status !== 201 || res.data.status !== 'PENDING' || !res.data.code.startsWith('PN-')) {
        throw new Error(`Import creation failed: ${JSON.stringify(res.data)}`);
      }

      this.importMovementId = res.data.id;
    });

    await this.recordTest('Movement', 'Admin approves Import receipt -> COMPLETED & Stock Incremented (+15)', async () => {
      const res = await this.request('PATCH', `/movements/${this.importMovementId}/status`, { status: 'COMPLETED' }, this.adminToken);
      if (res.status !== 200 || res.data.status !== 'COMPLETED') {
        throw new Error(`Approval failed: ${JSON.stringify(res.data)}`);
      }
    });

    // SUITE 5: Dashboard Analytics
    console.log('\n📊 SUITE 5: Dashboard Analytics');

    await this.recordTest('Dashboard', 'Fetch real-time stats KPI indicators', async () => {
      const res = await this.request('GET', '/dashboard/stats', null, this.adminToken);
      if (res.status !== 200 || res.data.totalProducts < 1) {
        throw new Error(`Dashboard stats mismatch: ${JSON.stringify(res.data)}`);
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
