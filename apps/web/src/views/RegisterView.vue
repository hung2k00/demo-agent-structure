<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Package, User, Mail, Lock, Building, ArrowRight, CheckCircle2, AlertCircle, Plus, Store } from '@lucide/vue'

const emit = defineEmits(['registered', 'switch-to-login'])

interface TenantOption {
  id: string
  name: string
}

const tenantOptions = ref<TenantOption[]>([])
const selectedTenantMode = ref<'existing' | 'new'>('new')
const selectedTenantId = ref('')

const form = reactive({
  fullName: '',
  email: '',
  companyName: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const fetchingTenants = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loadTenants = async () => {
  fetchingTenants.value = true
  try {
    const res = await fetch('http://localhost:3002/api/v1/auth/tenants')
    if (res.ok) {
      const data = await res.json()
      tenantOptions.value = data
      if (data.length > 0) {
        selectedTenantMode.value = 'existing'
        selectedTenantId.value = data[0].id
      }
    }
  } catch (err) {
    console.error('Failed to load tenants', err)
  } finally {
    fetchingTenants.value = false
  }
}

onMounted(() => {
  loadTenants()
})

const validatePasswordRules = (pass: string) => {
  return {
    minLength: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[!@#$%^&*]/.test(pass)
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không trùng khớp'
    return
  }

  const rules = validatePasswordRules(form.password)
  if (!Object.values(rules).every(Boolean)) {
    errorMessage.value = 'Mật khẩu chưa đáp ứng đầy đủ tiêu chuẩn bảo mật'
    return
  }

  if (selectedTenantMode.value === 'existing' && !selectedTenantId.value) {
    errorMessage.value = 'Vui lòng chọn một Cửa hàng/Kho hàng hiện có'
    return
  }

  if (selectedTenantMode.value === 'new' && !form.companyName.trim()) {
    errorMessage.value = 'Vui lòng nhập tên Cửa hàng/Kho hàng mới'
    return
  }

  loading.value = true

  try {
    const payload: Record<string, string> = {
      fullName: form.fullName,
      email: form.email,
      password: form.password
    }

    if (selectedTenantMode.value === 'existing') {
      payload.tenantId = selectedTenantId.value
    } else {
      payload.companyName = form.companyName.trim()
    }

    const res = await fetch('http://localhost:3002/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      if (Array.isArray(data.message)) {
        errorMessage.value = data.message.join(', ')
      } else {
        errorMessage.value = data.message || 'Đăng ký không thành công'
      }
      return
    }

    successMessage.value = 'Đăng ký tài khoản thành công! Đang chuyển hướng...'
    setTimeout(() => {
      emit('registered', data)
    }, 1500)
  } catch (err) {
    errorMessage.value = 'Không thể kết nối đến máy chủ API'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
      <!-- Glow background accent -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

      <!-- Header -->
      <div class="text-center space-y-2 relative z-10">
        <div class="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-2">
          <Package class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400">
          Tạo Tài Khoản SmartWMS Pro
        </h2>
        <p class="text-xs text-slate-400">Khởi tạo hoặc gia nhập hệ thống quản lý kho vận thông minh</p>
      </div>

      <!-- Messages -->
      <div v-if="errorMessage" class="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start space-x-2">
        <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 relative z-10">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Họ và Tên Người Dùng</label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              v-model="form.fullName" 
              type="text" 
              required
              placeholder="Nguyễn Văn A"
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Doanh Nghiệp</label>
          <div class="relative">
            <Mail class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              v-model="form.email" 
              type="email" 
              required
              placeholder="admin@company.com"
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <!-- Store / Warehouse Mode Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-300">Cửa Hàng / Kho Hàng</label>
          
          <div class="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              type="button"
              @click="selectedTenantMode = 'existing'"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1.5',
                selectedTenantMode === 'existing' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              <Store class="w-3.5 h-3.5" />
              <span>Chọn Kho Đã Có</span>
            </button>

            <button
              type="button"
              @click="selectedTenantMode = 'new'"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1.5',
                selectedTenantMode === 'new' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tạo Kho Mới</span>
            </button>
          </div>

          <!-- Existing Tenant Dropdown -->
          <div v-if="selectedTenantMode === 'existing'" class="relative">
            <Store class="w-4 h-4 absolute left-3.5 top-3 text-slate-500 z-10" />
            <select
              v-model="selectedTenantId"
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option v-if="tenantOptions.length === 0" value="" disabled>Chưa có kho hàng nào. Vui lòng tạo kho mới.</option>
              <option v-for="t in tenantOptions" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>

          <!-- New Tenant Input -->
          <div v-else class="relative">
            <Building class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              v-model="form.companyName" 
              type="text" 
              placeholder="Nhập tên Cửa hàng / Kho hàng mới..."
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Mật Khẩu</label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              v-model="form.password" 
              type="password" 
              required
              placeholder="••••••••"
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <!-- Live Password Rules Indicator -->
          <div class="mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
            <span :class="validatePasswordRules(form.password).minLength ? 'text-emerald-400' : ''">✓ Tối thiểu 8 ký tự</span>
            <span :class="validatePasswordRules(form.password).hasUpper ? 'text-emerald-400' : ''">✓ Chữ hoa (A-Z)</span>
            <span :class="validatePasswordRules(form.password).hasLower ? 'text-emerald-400' : ''">✓ Chữ thường (a-z)</span>
            <span :class="validatePasswordRules(form.password).hasSpecial ? 'text-emerald-400' : ''">✓ Ký tự đặc biệt (!@#$)</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Xác Nhận Mật Khẩu</label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              required
              placeholder="••••••••"
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{{ loading ? 'Đang Xử Lý...' : 'Đăng Ký Tài Khoản' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <!-- Footer switch to login -->
      <div class="text-center pt-2 relative z-10 border-t border-slate-800/80">
        <p class="text-xs text-slate-400">
          Đã có tài khoản kho? 
          <button 
            @click="emit('switch-to-login')" 
            class="text-indigo-400 font-semibold hover:underline ml-1"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
