<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">建立新帳戶</h2>
        <p class="mt-2 text-sm text-gray-500">立即開始您的 CBT 練習旅程</p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- Google 註冊按鈕 -->
        <div>
          <button @click="signUpWithGoogle" class="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
            <img :src="googleIconUrl" alt="Google" class="w-5 h-5 mr-2" />
            使用 Google 註冊
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">或使用電子郵件</span>
          </div>
        </div>

        <!-- 電子郵件註冊表單 -->
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input id="name" v-model="name" name="name" type="text" autocomplete="name" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="您的姓名">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="name@example.com">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
              <input id="password" v-model="password" name="password" type="password" autocomplete="new-password" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="至少 6 個字元">
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">確認密碼</label>
              <input id="confirm-password" v-model="confirmPassword" name="confirm-password" type="password" autocomplete="new-password" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="再次輸入密碼">
            </div>
          </div>

          <div class="flex items-center">
            <input id="terms" v-model="terms" name="terms" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              我同意<router-link to="/terms" class="text-indigo-600 hover:text-indigo-500 font-medium">服務條款</router-link>與<router-link to="/privacy" class="text-indigo-600 hover:text-indigo-500 font-medium">隱私政策</router-link>
            </label>
          </div>

          <div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all">
              註冊
            </button>
          </div>
        </form>
      </div>
      
      <div class="text-center text-sm">
        <span class="text-gray-600">已經有帳號？</span>
        <button @click="$router.push('/login')" class="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
          前往登入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import googleIconUrl from '@/assets/google.svg?url'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supa } from '@/services/supaClient'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)
const router = useRouter()

// Google 註冊
const signUpWithGoogle = async () => {
  try {
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  } catch (error: any) {
    console.error('Google 註冊錯誤:', error.message)
    alert('Google 註冊失敗: ' + error.message)
  }
}

// 電子郵件註冊
const handleRegister = async () => {
  try {
    if (password.value !== confirmPassword.value) {
      throw new Error('密碼不匹配')
    }

    const { error: authError } = await supa.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: name.value,
          email: email.value
        },
        emailRedirectTo: window.location.origin
      }
    })

    if (authError) throw authError

    alert('註冊成功！請檢查您的電子郵件以驗證您的帳號。')
    router.push('/login')
  } catch (error: any) {
    console.error('註冊錯誤:', error.message)
    alert('註冊失敗: ' + error.message)
  }
}
</script>