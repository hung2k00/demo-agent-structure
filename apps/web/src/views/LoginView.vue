<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Package, Mail, Lock, ArrowRight, AlertCircle } from '@lucide/vue'

const emit = defineEmits(['login-success', 'switch-to-register'])

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const res = await fetch('http://localhost:3002/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || 'Email hoặc mật khẩu không chính xác'
      return
    }

    emit('login-success', data)
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
      <!-- Background accent -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

      <!-- Header -->
      <div class="text-center space-y-2 relative z-10">
        <div class="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-2">
          <Package class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400">
          Đăng Nhập SmartWMS Pro
        </h2>
        <p class="text-xs text-slate-400">Truy cập hệ thống quản lý kho hàng doanh nghiệp</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 relative z-10">
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
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{{ loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <!-- Footer switch to register -->
      <div class="text-center pt-2 relative z-10 border-t border-slate-800/80">
        <p class="text-xs text-slate-400">
          Chưa có tài khoản kho? 
          <button 
            @click="emit('switch-to-register')" 
            class="text-indigo-400 font-semibold hover:underline ml-1"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
