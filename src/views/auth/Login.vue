<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supa } from '@/services/supaClient'
import googleIconUrl from '@/assets/google.svg?url'

const router = useRouter()
const route = useRoute()

// Mode toggle: 'login' or 'register'
const isRegisterMode = ref(false)

// Form states
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)
const loading = ref(false)

onMounted(() => {
  // Check if we should start in register mode (e.g. from a link)
  if (route.path === '/register' || route.query.mode === 'register') {
    isRegisterMode.value = true
  }
})

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  // Reset form errors or fields if desired, but keeping them might be user-friendly
}

const handleGoogleAuth = async () => {
  try {
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  } catch (error: any) {
    alert('Google 驗證錯誤: ' + error.message)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isRegisterMode.value) {
      // REGISTER LOGIC
      if (password.value !== confirmPassword.value) {
        throw new Error('密碼不匹配')
      }
      if (!terms.value) {
        throw new Error('請同意服務條款')
      }

      const { error } = await supa.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: { full_name: name.value },
          emailRedirectTo: window.location.origin
        }
      })
      if (error) throw error
      alert('註冊成功！請檢查您的電子郵件以驗證您的帳號。')
      toggleMode() // Switch to login after successful registration (or user can wait for email)
      
    } else {
      // LOGIN LOGIC
      const { error } = await supa.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      router.push('/home') // Redirect to dashboard
    }
  } catch (error: any) {
    alert((isRegisterMode.value ? '註冊失敗: ' : '登入失敗: ') + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-white font-sans">
    
    <!-- Left Panel (Visual) - Hidden on mobile -->
    <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative flex-col justify-between p-12 overflow-hidden">
      <!-- Abstract Background -->
      <div class="absolute inset-0">
         <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
         <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse-slow delay-1000"></div>
         <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div class="relative z-10 cursor-pointer" @click="router.push('/')">
        <div class="flex items-center gap-3 text-white">
          <div class="w-10 h-10 bg-white/10 backdrop-blur border border-white/10 rounded-xl flex items-center justify-center font-bold text-lg">C</div>
          <span class="font-bold tracking-tight text-xl">CBT SaaS</span>
        </div>
      </div>

      <div class="relative z-10 max-w-lg">
        <blockquote class="text-3xl font-medium text-white leading-tight mb-8">
          "{{ isRegisterMode ? '開始這段旅程，重新定義你的內在對話。' : '對抗壓力最強大的武器，就是我們轉念的能力。' }}"
        </blockquote>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">W</div>
          <div>
            <div class="text-white font-bold text-lg">威廉·詹姆斯</div>
            <div class="text-indigo-200 text-sm font-medium">哲學家與心理學家</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
      <div class="w-full max-w-sm space-y-8 relative z-10">
        
        <div class="text-center lg:text-left transition-all duration-300">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-2">{{ isRegisterMode ? '建立新帳戶' : '歡迎回來' }}</h2>
          <p class="text-gray-500">{{ isRegisterMode ? '立即開始您的 CBT 練習旅程' : '請輸入您的帳號資訊以登入儀表板。' }}</p>
        </div>

        <div class="space-y-6">
          <button 
            @click="handleGoogleAuth"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
          >
            <img :src="googleIconUrl" alt="Google" class="w-5 h-5" />
            {{ isRegisterMode ? '使用 Google 註冊' : '使用 Google 登入' }}
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
            <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-3 text-gray-400 font-medium tracking-wide">或使用電子郵件</span></div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            
            <!-- Register Only: Name -->
            <div v-if="isRegisterMode" class="animate-in fade-in slide-in-from-top-2 duration-300">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
              <input 
                id="name" 
                v-model="name" 
                type="text" 
                required 
                class="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="您的姓名"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">電子郵件</label>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                class="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="name@company.com"
              />
            </div>
            
            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                 <label for="password" class="block text-sm font-medium text-gray-700">密碼</label>
                 <a v-if="!isRegisterMode" href="#" class="text-xs font-semibold text-indigo-600 hover:text-indigo-500">忘記密碼？</a>
              </div>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                required 
                class="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <!-- Register Only: Confirm Password & Terms -->
            <template v-if="isRegisterMode">
              <div class="animate-in fade-in slide-in-from-top-2 duration-300">
                <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1.5">確認密碼</label>
                <input 
                  id="confirm-password" 
                  v-model="confirmPassword" 
                  type="password" 
                  required 
                  class="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all"
                  placeholder="再次輸入密碼"
                />
              </div>

              <div class="flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                <input id="terms" v-model="terms" name="terms" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded cursor-pointer">
                <label for="terms" class="ml-2 block text-sm text-gray-600">
                  我同意 <a href="#" class="text-indigo-600 hover:text-indigo-500 font-semibold hover:underline">服務條款</a> 與 <a href="#" class="text-indigo-600 hover:text-indigo-500 font-semibold hover:underline">隱私政策</a>
                </label>
              </div>
            </template>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? '處理中...' : (isRegisterMode ? '註冊帳戶' : '登入') }}
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-gray-500">
          {{ isRegisterMode ? '已經有帳號？' : '還沒有帳號？' }}
          <button @click="toggleMode" class="font-bold text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
             {{ isRegisterMode ? '前往登入' : '立即註冊' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>