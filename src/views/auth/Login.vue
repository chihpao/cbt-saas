<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supa } from '@/services/supaClient'
import logoUrl from '@/assets/logo.svg?url'
import googleIconUrl from '@/assets/google.svg?url'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const signInWithGoogle = async () => {
  try {
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  } catch (error: any) {
    alert('Google 登入錯誤: ' + error.message)
  }
}

const handleLogin = async () => {
  loading.value = true
  try {
    const { error } = await supa.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.push('/')
  } catch (error: any) {
    alert('登入失敗: ' + error.message)
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
         <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
         <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 text-white">
          <div class="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center font-bold">C</div>
          <span class="font-medium tracking-tight">CBT SaaS</span>
        </div>
      </div>

      <div class="relative z-10 max-w-lg">
        <blockquote class="text-2xl font-medium text-white leading-relaxed mb-6">
          "對抗壓力最強大的武器，就是我們轉念的能力。"
        </blockquote>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">W</div>
          <div>
            <div class="text-white font-medium">威廉·詹姆斯</div>
            <div class="text-indigo-200 text-sm">哲學家與心理學家</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-sm space-y-8">
        
        <div class="text-center lg:text-left">
          <h2 class="text-2xl font-bold tracking-tight text-gray-900">歡迎回來</h2>
          <p class="mt-2 text-sm text-gray-500">請輸入您的帳號資訊以登入儀表板。</p>
        </div>

        <div class="space-y-4">
          <button 
            @click="signInWithGoogle"
            class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
          >
            <img :src="googleIconUrl" alt="Google" class="w-5 h-5" />
            使用 Google 登入
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
            <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-2 text-gray-400">或使用電子郵件</span></div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">電子郵件</label>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                class="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-shadow"
                placeholder="name@company.com"
              />
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-1.5">
                 <label for="password" class="block text-sm font-medium text-gray-700">密碼</label>
                 <a href="#" class="text-xs font-medium text-indigo-600 hover:text-indigo-500">忘記密碼？</a>
              </div>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                required 
                class="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? '登入中...' : '登入' }}
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-gray-500">
          還沒有帳號？ 
          <a href="#" @click.prevent="$router.push('/register')" class="font-medium text-indigo-600 hover:text-indigo-500">立即註冊</a>
        </p>
      </div>
    </div>
  </div>
</template>