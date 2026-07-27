<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import RegisterView from './views/RegisterView.vue'
import LoginView from './views/LoginView.vue'
import { 
  Package, 
  ArrowDownLeft, 
  TrendingUp, 
  LogOut,
  Plus,
  LayoutDashboard,
  Boxes,
  Truck,
  FileSpreadsheet,
  History,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building
} from '@lucide/vue'

const authStore = useAuthStore()
const currentView = ref<'register' | 'login' | 'dashboard'>('login')
const activeTab = ref<'dashboard' | 'products' | 'suppliers' | 'movements' | 'logs' | 'users'>('dashboard')

// State data from Backend
const stats = ref({
  totalProducts: 0,
  totalStockQuantity: 0,
  totalStockValue: 0,
  pendingMovementsCount: 0,
  lowStockAlertsCount: 0,
})

const products = ref<any[]>([])
const suppliers = ref<any[]>([])
const movements = ref<any[]>([])
const logs = ref<any[]>([])
const usersList = ref<any[]>([])

const loadingData = ref(false)
const globalMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// Modals State
const showProductModal = ref(false)
const showSupplierModal = ref(false)
const showMovementModal = ref(false)

// Search & Filter
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedMovementType = ref('')

// Form Models
const productForm = reactive({
  sku: '',
  name: '',
  category: 'Điện tử',
  unit: 'Cái',
  price: 0,
  minQuantity: 5,
  description: ''
})

const supplierForm = reactive({
  code: '',
  name: '',
  email: '',
  phone: '',
  address: ''
})

const movementForm = reactive({
  type: 'IMPORT' as 'IMPORT' | 'EXPORT',
  supplierId: '',
  note: '',
  items: [{ productId: '', quantity: 1, price: 0 }]
})

// Auto Auth Setup
onMounted(() => {
  if (authStore.token && authStore.user) {
    currentView.value = 'dashboard'
    loadDashboardData()
  } else {
    currentView.value = 'login'
  }
})

const handleAuthSuccess = (data: { accessToken: string; user: any }) => {
  authStore.setAuth(data.accessToken, data.user)
  currentView.value = 'dashboard'
  loadDashboardData()
}

const handleLogout = () => {
  authStore.logout()
  currentView.value = 'login'
}

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`http://localhost:3002/api/v1${endpoint}`, { ...options, headers })
  if (res.status === 401) {
    handleLogout()
    throw new Error('Phiên làm việc hết hạn')
  }
  const data = await res.json()
  if (!res.ok) {
    throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Lỗi xử lý')
  }
  return data
}

// Load Data Methods
const loadDashboardData = async () => {
  loadingData.value = true
  try {
    const [statsRes, productsRes, suppliersRes, movementsRes, logsRes] = await Promise.allSettled([
      apiFetch('/dashboard/stats'),
      apiFetch('/products'),
      apiFetch('/suppliers'),
      apiFetch('/movements'),
      apiFetch('/movements/logs/history'),
    ])

    if (statsRes.status === 'fulfilled') stats.value = statsRes.value
    if (productsRes.status === 'fulfilled') products.value = productsRes.value
    if (suppliersRes.status === 'fulfilled') suppliers.value = suppliersRes.value
    if (movementsRes.status === 'fulfilled') movements.value = movementsRes.value
    if (logsRes.status === 'fulfilled') logs.value = logsRes.value

    if (authStore.user?.role === 'ADMIN') {
      try {
        usersList.value = await apiFetch('/users')
      } catch (e) {
        console.error(e)
      }
    }
  } catch (err: any) {
    showToast('error', err.message)
  } finally {
    loadingData.value = false
  }
}

const showToast = (type: 'success' | 'error', text: string) => {
  globalMessage.value = { type, text }
  setTimeout(() => {
    globalMessage.value = null
  }, 4000)
}

// CRUD Operations
const handleCreateProduct = async () => {
  try {
    await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify({
        ...productForm,
        price: Number(productForm.price),
        minQuantity: Number(productForm.minQuantity),
      })
    })
    showToast('success', 'Thêm sản phẩm mới thành công!')
    showProductModal.value = false
    loadDashboardData()
    // Reset
    productForm.sku = ''
    productForm.name = ''
    productForm.price = 0
  } catch (err: any) {
    showToast('error', err.message)
  }
}

const handleCreateSupplier = async () => {
  try {
    await apiFetch('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierForm)
    })
    showToast('success', 'Thêm nhà cung cấp thành công!')
    showSupplierModal.value = false
    loadDashboardData()
    supplierForm.code = ''
    supplierForm.name = ''
  } catch (err: any) {
    showToast('error', err.message)
  }
}

const handleCreateMovement = async () => {
  try {
    await apiFetch('/movements', {
      method: 'POST',
      body: JSON.stringify({
        type: movementForm.type,
        supplierId: movementForm.supplierId || undefined,
        note: movementForm.note,
        items: movementForm.items.map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          price: Number(i.price)
        }))
      })
    })
    showToast('success', 'Tạo phiếu đề xuất thành công!')
    showMovementModal.value = false
    loadDashboardData()
  } catch (err: any) {
    showToast('error', err.message)
  }
}

const handleUpdateMovementStatus = async (id: string, status: 'COMPLETED' | 'CANCELLED') => {
  try {
    await apiFetch(`/movements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    showToast('success', `Đã cập nhật phiếu sang trạng thái ${status === 'COMPLETED' ? 'Hoàn tất' : 'Hủy bỏ'}`)
    loadDashboardData()
  } catch (err: any) {
    showToast('error', err.message)
  }
}

const handleUpdateUserRole = async (userId: string, newRole: string) => {
  try {
    await apiFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    })
    showToast('success', 'Đã cập nhật vai trò người dùng thành công!')
    loadDashboardData()
  } catch (err: any) {
    showToast('error', err.message)
  }
}

// Filtered Computed Data
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesSearch = !searchQuery.value || p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || p.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const filteredMovements = computed(() => {
  return movements.value.filter(m => {
    return !selectedMovementType.value || m.type === selectedMovementType.value
  })
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}
</script>

<template>
  <!-- Màn Đăng Nhập -->
  <LoginView 
    v-if="currentView === 'login'" 
    @login-success="handleAuthSuccess" 
    @switch-to-register="currentView = 'register'" 
  />

  <!-- Màn Đăng Ký -->
  <RegisterView 
    v-else-if="currentView === 'register'" 
    @registered="handleAuthSuccess" 
    @switch-to-login="currentView = 'login'" 
  />

  <!-- Màn Dashboard Admin / Staff -->
  <div v-else class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- Global Toast Alert -->
    <div 
      v-if="globalMessage" 
      class="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border animate-bounce"
      :class="globalMessage.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'"
    >
      <CheckCircle2 v-if="globalMessage.type === 'success'" class="w-5 h-5 shrink-0" />
      <XCircle v-else class="w-5 h-5 shrink-0" />
      <span>{{ globalMessage.text }}</span>
    </div>

    <!-- Top Header Navigation -->
    <header class="glass-panel sticky top-0 z-40 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
          <Package class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400">
            SmartWMS Pro
          </h1>
          <p class="text-xs text-slate-400 flex items-center space-x-1">
            <Building class="w-3 h-3 text-indigo-400" />
            <span>{{ authStore.user?.tenantName || 'Kho Hàng Quản Lý' }}</span>
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="hidden lg:flex items-center space-x-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button 
          @click="activeTab = 'dashboard'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>Tổng Quan</span>
        </button>

        <button 
          @click="activeTab = 'products'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <Boxes class="w-4 h-4" />
          <span>Sản Phẩm</span>
        </button>

        <button 
          @click="activeTab = 'suppliers'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <Truck class="w-4 h-4" />
          <span>Nhà Cung Cấp</span>
        </button>

        <button 
          @click="activeTab = 'movements'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'movements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Nhập / Xuất Kho</span>
        </button>

        <button 
          @click="activeTab = 'logs'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <History class="w-4 h-4" />
          <span>Nhật Ký Tồn Kho</span>
        </button>

        <button 
          v-if="authStore.user?.role === 'ADMIN'"
          @click="activeTab = 'users'"
          :class="['px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer', activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200']"
        >
          <Users class="w-4 h-4" />
          <span>Thành Viên</span>
        </button>
      </nav>

      <!-- User Info & Logout -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2.5 px-3 py-1.5 glass-panel rounded-xl border border-slate-800">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
            {{ authStore.user?.fullName?.charAt(0) || 'U' }}
          </div>
          <div class="text-left hidden md:block">
            <p class="text-xs font-semibold text-slate-200">{{ authStore.user?.fullName }}</p>
            <p class="text-[10px] text-indigo-400 font-bold uppercase">{{ authStore.user?.role }}</p>
          </div>
        </div>

        <button 
          @click="handleLogout"
          title="Đăng xuất"
          class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-800 cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Main Dynamic Content -->
    <main class="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      <!-- 1. DASHBOARD TAB -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all">
            <div class="flex justify-between items-start mb-3">
              <span class="text-xs font-medium text-slate-400">Tổng Số Mặt Hàng</span>
              <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Boxes class="w-5 h-5" />
              </div>
            </div>
            <span class="text-2xl font-bold tracking-tight text-white">{{ stats.totalProducts }} sp</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all">
            <div class="flex justify-between items-start mb-3">
              <span class="text-xs font-medium text-slate-400">Tổng Lượng Tồn Kho</span>
              <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowDownLeft class="w-5 h-5" />
              </div>
            </div>
            <span class="text-2xl font-bold tracking-tight text-emerald-400">{{ stats.totalStockQuantity }} đơn vị</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-all">
            <div class="flex justify-between items-start mb-3">
              <span class="text-xs font-medium text-slate-400">Giá Trị Quy Đổi Kho</span>
              <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp class="w-5 h-5" />
              </div>
            </div>
            <span class="text-xl font-bold tracking-tight text-blue-300">{{ formatCurrency(stats.totalStockValue) }}</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all">
            <div class="flex justify-between items-start mb-3">
              <span class="text-xs font-medium text-slate-400">Phiếu Chờ Duyệt</span>
              <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock class="w-5 h-5" />
              </div>
            </div>
            <span class="text-2xl font-bold tracking-tight text-amber-300">{{ stats.pendingMovementsCount }} phiếu</span>
          </div>
        </div>

        <!-- Recent Movements Table -->
        <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-100">Phiếu Nhập / Xuất Kho Gần Đây</h2>
              <p class="text-xs text-slate-400">Theo dõi tiến độ duyệt và trạng thái vận hành kho</p>
            </div>
            <button @click="activeTab = 'movements'" class="text-xs text-indigo-400 font-semibold hover:underline">
              Xem Tất Cả &rarr;
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-800">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="px-4 py-3">Mã Phiếu</th>
                  <th class="px-4 py-3">Loại</th>
                  <th class="px-4 py-3">Tổng Tiền</th>
                  <th class="px-4 py-3">Trạng Thái</th>
                  <th class="px-4 py-3 text-right">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
                <tr v-for="m in movements.slice(0, 5)" :key="m.id" class="hover:bg-slate-900/40">
                  <td class="px-4 py-3 font-mono font-semibold text-indigo-300">{{ m.code }}</td>
                  <td class="px-4 py-3">
                    <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', m.type === 'IMPORT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">
                      {{ m.type === 'IMPORT' ? 'Nhập Kho' : 'Xuất Kho' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium text-slate-200">{{ formatCurrency(m.totalAmount) }}</td>
                  <td class="px-4 py-3">
                    <span :class="['text-[11px] font-medium', m.status === 'COMPLETED' ? 'text-emerald-400' : m.status === 'CANCELLED' ? 'text-rose-400' : 'text-amber-400']">
                      {{ m.status === 'COMPLETED' ? '✓ Hoàn tất' : m.status === 'CANCELLED' ? '✕ Hủy bỏ' : '⏳ Chờ duyệt' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right font-mono text-slate-400">{{ new Date(m.createdAt).toLocaleDateString('vi-VN') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. PRODUCTS TAB -->
      <div v-else-if="activeTab === 'products'" class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center space-x-3 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
              <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Tìm theo tên hoặc SKU..." 
                class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button 
            v-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'WAREHOUSE_MANAGER'"
            @click="showProductModal = true" 
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-900/30 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>

        <!-- Products Table -->
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Mã SKU</th>
                <th class="px-4 py-3">Tên Sản Phẩm</th>
                <th class="px-4 py-3">Danh Mục</th>
                <th class="px-4 py-3">Số Lượng Tồn</th>
                <th class="px-4 py-3">Tồn Tối Thiểu</th>
                <th class="px-4 py-3">Đơn Giá</th>
                <th class="px-4 py-3 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-slate-900/40">
                <td class="px-4 py-3 font-mono font-semibold text-indigo-300">{{ p.sku }}</td>
                <td class="px-4 py-3 font-medium text-slate-100">{{ p.name }}</td>
                <td class="px-4 py-3 text-slate-400">{{ p.category }}</td>
                <td class="px-4 py-3 font-bold text-slate-200">{{ p.quantity }} {{ p.unit }}</td>
                <td class="px-4 py-3 text-slate-400">{{ p.minQuantity }} {{ p.unit }}</td>
                <td class="px-4 py-3 font-semibold text-emerald-400">{{ formatCurrency(p.price) }}</td>
                <td class="px-4 py-3 text-right">
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', p.isLowStock ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20']">
                    {{ p.isLowStock ? '⚠️ Tồn kho thấp' : '✓ An toàn' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. SUPPLIERS TAB -->
      <div v-else-if="activeTab === 'suppliers'" class="space-y-4">
        <div class="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
          <h2 class="text-sm font-bold text-slate-200">Danh Sách Nhà Cung Cấp Kho</h2>
          <button 
            v-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'WAREHOUSE_MANAGER'"
            @click="showSupplierModal = true" 
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Thêm Nhà Cung Cấp</span>
          </button>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Mã NCC</th>
                <th class="px-4 py-3">Tên Nhà Cung Cấp</th>
                <th class="px-4 py-3">Email Liên Hệ</th>
                <th class="px-4 py-3">Số Điện Thoại</th>
                <th class="px-4 py-3">Địa Chỉ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr v-for="s in suppliers" :key="s.id" class="hover:bg-slate-900/40">
                <td class="px-4 py-3 font-mono font-semibold text-indigo-300">{{ s.code }}</td>
                <td class="px-4 py-3 font-medium text-slate-100">{{ s.name }}</td>
                <td class="px-4 py-3 text-slate-400">{{ s.email || '-' }}</td>
                <td class="px-4 py-3 text-slate-400">{{ s.phone || '-' }}</td>
                <td class="px-4 py-3 text-slate-400">{{ s.address || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. MOVEMENTS TAB -->
      <div v-else-if="activeTab === 'movements'" class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center space-x-2">
            <select v-model="selectedMovementType" class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
              <option value="">Tất cả loại phiếu</option>
              <option value="IMPORT">Phiếu Nhập Kho</option>
              <option value="EXPORT">Phiếu Xuất Kho</option>
            </select>
          </div>

          <button 
            @click="showMovementModal = true" 
            class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-900/30"
          >
            <Plus class="w-4 h-4" />
            <span>Lập Phiếu Đề Xuất Nhập / Xuất</span>
          </button>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Mã Phiếu</th>
                <th class="px-4 py-3">Loại Giao Dịch</th>
                <th class="px-4 py-3">Nhà Cung Cấp</th>
                <th class="px-4 py-3">Người Tạo</th>
                <th class="px-4 py-3">Tổng Tiền</th>
                <th class="px-4 py-3">Trạng Thái</th>
                <th class="px-4 py-3 text-right">Thao Tác Duyệt</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr v-for="m in filteredMovements" :key="m.id" class="hover:bg-slate-900/40">
                <td class="px-4 py-3 font-mono font-semibold text-indigo-300">{{ m.code }}</td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', m.type === 'IMPORT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">
                    {{ m.type === 'IMPORT' ? 'Nhập Kho' : 'Xuất Kho' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-300">{{ m.supplier?.name || 'N/A' }}</td>
                <td class="px-4 py-3 text-slate-400">{{ m.createdBy?.fullName }}</td>
                <td class="px-4 py-3 font-semibold text-slate-100">{{ formatCurrency(m.totalAmount) }}</td>
                <td class="px-4 py-3">
                  <span :class="['text-[11px] font-semibold', m.status === 'COMPLETED' ? 'text-emerald-400' : m.status === 'CANCELLED' ? 'text-rose-400' : 'text-amber-400']">
                    {{ m.status === 'COMPLETED' ? '✓ Hoàn tất' : m.status === 'CANCELLED' ? '✕ Hủy' : '⏳ Chờ duyệt' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-1.5">
                  <template v-if="m.status === 'PENDING' && (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'WAREHOUSE_MANAGER')">
                    <button @click="handleUpdateMovementStatus(m.id, 'COMPLETED')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg transition-all cursor-pointer">
                      Duyệt COMPLETED
                    </button>
                    <button @click="handleUpdateMovementStatus(m.id, 'CANCELLED')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold rounded-lg transition-all cursor-pointer">
                      Hủy
                    </button>
                  </template>
                  <span v-else class="text-[10px] text-slate-500 italic">Đã khóa</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. AUDIT LOGS TAB -->
      <div v-else-if="activeTab === 'logs'" class="space-y-4">
        <div class="glass-panel p-4 rounded-2xl border border-slate-800">
          <h2 class="text-sm font-bold text-slate-200">Lịch Sử Biến Động Tồn Kho Real-time</h2>
          <p class="text-xs text-slate-400">Nhật ký theo dõi sự thay đổi số lượng kho qua từng giao dịch</p>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Mã Tham Chiếu</th>
                <th class="px-4 py-3">Sản Phẩm</th>
                <th class="px-4 py-3">Mã SKU</th>
                <th class="px-4 py-3">Số Lượng Biến Động</th>
                <th class="px-4 py-3">Tồn Kho Trước &rarr; Sau</th>
                <th class="px-4 py-3 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr v-for="l in logs" :key="l.id" class="hover:bg-slate-900/40">
                <td class="px-4 py-3 font-mono font-semibold text-indigo-300">{{ l.refCode }}</td>
                <td class="px-4 py-3 font-medium text-slate-200">{{ l.product?.name }}</td>
                <td class="px-4 py-3 text-slate-400 font-mono">{{ l.product?.sku }}</td>
                <td class="px-4 py-3 font-bold" :class="l.quantityChange > 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange }}
                </td>
                <td class="px-4 py-3 font-mono text-slate-300">{{ l.previousQuantity }} &rarr; <span class="font-bold text-white">{{ l.newQuantity }}</span></td>
                <td class="px-4 py-3 text-right font-mono text-slate-400 text-[11px]">{{ new Date(l.createdAt).toLocaleString('vi-VN') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 6. USERS TAB -->
      <div v-else-if="activeTab === 'users' && authStore.user?.role === 'ADMIN'" class="space-y-4">
        <div class="glass-panel p-4 rounded-2xl border border-slate-800">
          <h2 class="text-sm font-bold text-slate-200">Quản Lý Thành Viên Kho (Chỉ dành cho Admin)</h2>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="px-4 py-3">Họ và Tên</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Vai Trò Hiện Tại</th>
                <th class="px-4 py-3 text-right">Đổi Vai Trò</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr v-for="u in usersList" :key="u.id" class="hover:bg-slate-900/40">
                <td class="px-4 py-3 font-medium text-slate-100">{{ u.fullName }}</td>
                <td class="px-4 py-3 text-slate-400">{{ u.email }}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <select 
                    :value="u.role"
                    @change="e => handleUpdateUserRole(u.id, (e.target as HTMLSelectElement).value)"
                    class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL 1: THÊM SẢN PHẨM -->
    <div v-if="showProductModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-slate-100">Thêm Sản Phẩm Mới Vào Kho</h3>
        <form @submit.prevent="handleCreateProduct" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-300 mb-1">Mã SKU (UPPERCASE, dụ: LAP-DELL-XPS15)</label>
            <input v-model="productForm.sku" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1">Tên Sản Phẩm</label>
            <input v-model="productForm.name" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1">Danh Mục</label>
              <input v-model="productForm.category" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Đơn Vị Tính</label>
              <input v-model="productForm.unit" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1">Đơn Giá (VNĐ)</label>
              <input v-model="productForm.price" required type="number" min="0" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Tồn Tối Thiểu</label>
              <input v-model="productForm.minQuantity" required type="number" min="0" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-3">
            <button type="button" @click="showProductModal = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Hủy</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Lưu Sản Phẩm</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: THÊM NHÀ CUNG CẤP -->
    <div v-if="showSupplierModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-slate-100">Thêm Nhà Cung Cấp Mới</h3>
        <form @submit.prevent="handleCreateSupplier" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-300 mb-1">Mã Nhà Cung Cấp (dụ: SUP-DELL)</label>
            <input v-model="supplierForm.code" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1">Tên Nhà Cung Cấp</label>
            <input v-model="supplierForm.name" required type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1">Email</label>
            <input v-model="supplierForm.email" type="email" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div>
            <label class="block text-slate-300 mb-1">Số Điện Thoại</label>
            <input v-model="supplierForm.phone" type="text" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>
          <div class="flex justify-end space-x-2 pt-3">
            <button type="button" @click="showSupplierModal = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Hủy</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl">Lưu Nhà Cung Cấp</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: TẠO PHIẾU ĐỀ XUẤT NHẬP / XUẤT -->
    <div v-if="showMovementModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-slate-100">Lập Phiếu Đề Xuất Nhập / Xuất Kho</h3>
        <form @submit.prevent="handleCreateMovement" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1">Loại Giao Dịch</label>
              <select v-model="movementForm.type" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200">
                <option value="IMPORT">Phiếu Nhập Kho</option>
                <option value="EXPORT">Phiếu Xuất Kho</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Nhà Cung Cấp (nếu có)</label>
              <select v-model="movementForm.supplierId" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200">
                <option value="">Không chọn</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-300 mb-1">Chọn Sản Phẩm Giao Dịch</label>
            <select v-model="movementForm.items[0].productId" required class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200">
              <option value="" disabled>-- Chọn Sản Phẩm --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }} (SKU: {{ p.sku }} - Tồn: {{ p.quantity }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1">Số Lượng Yêu Cầu</label>
              <input v-model="movementForm.items[0].quantity" required type="number" min="1" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1">Đơn Giá Giao Dịch</label>
              <input v-model="movementForm.items[0].price" required type="number" min="0" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 mb-1">Ghi Chú Phiếu</label>
            <input v-model="movementForm.note" type="text" placeholder="Ví dụ: Nhập hàng đợt 1..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none" />
          </div>

          <div class="flex justify-end space-x-2 pt-3">
            <button type="button" @click="showMovementModal = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Hủy</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl">Tạo Phiếu Đề Xuất</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
