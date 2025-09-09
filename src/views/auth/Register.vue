<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">創建新帳戶</h2>
      </div>
      <div class="mt-8 space-y-6">
        <!-- Google 註冊按鈕 -->
        <div>
          <button @click="signUpWithGoogle" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.049 -9.42452 56.359 -10.9645 57.239 L -10.9545 57.329 L -6.81442 60.209 L -6.80442 60.199 C -4.56486 61.409 -1.92363 62.019 0.185547 62.019 C 4.93555 62.019 8.58555 59.129 10.0855 55.529 C 10.6655 54.129 10.9855 52.599 10.9855 50.999 C 10.9855 49.399 10.6655 47.869 10.0855 46.469 C 8.58555 42.859 4.93555 39.969 0.185547 39.969 C -1.30445 39.969 -2.73445 40.249 -4.05445 40.759 L -4.04445 40.759 L -9.03452 36.259 L -9.02452 36.259 C -6.55452 29.639 -0.904524 24.739 5.71548 24.739 C 12.9255 24.739 18.7155 30.529 18.7155 37.739 C 18.7155 38.429 18.6555 39.099 18.5455 39.759 L 18.5455 44.999 L 14.7655 44.999 C 13.3555 40.589 9.18555 39.969 5.71548 39.969 Z"/>
              </g>
            </svg>
            使用 Google 註冊
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">或</span>
          </div>
        </div>

        <!-- 電子郵件註冊表單 -->
        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="name" class="sr-only">姓名</label>
              <input id="name" v-model="name" name="name" type="text" autocomplete="name" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="姓名">
            </div>
            <div>
              <label for="email" class="sr-only">電子郵件</label>
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="電子郵件地址">
            </div>
            <div>
              <label for="password" class="sr-only">密碼</label>
              <input id="password" v-model="password" name="password" type="password" autocomplete="new-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="密碼 (至少6個字元)">
            </div>
            <div>
              <label for="confirm-password" class="sr-only">確認密碼</label>
              <input id="confirm-password" v-model="confirmPassword" name="confirm-password" type="password" autocomplete="new-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="確認密碼">
            </div>
          </div>

          <div class="flex items-center">
            <input id="terms" v-model="terms" name="terms" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              我同意 <a href="#" class="text-indigo-600 hover:text-indigo-500">服務條款</a> 和 <a href="#" class="text-indigo-600 hover:text-indigo-500">隱私政策</a>
            </label>
          </div>

          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              註冊
            </button>
          </div>
        </form>
      </div>
      
      <div class="text-center text-sm">
        <span class="text-gray-600">已經有帳號？</span>
        <button @click="$router.push('/login')" class="font-medium text-indigo-600 hover:text-indigo-500">
          前往登入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  } catch (error) {
    console.error('Google 註冊錯誤:', error.message)
    alert('Google 註冊失敗: ' + error.message)
  }
}

// 電子郵件註冊
const handleRegister = async () => {
  try {
    // 驗證密碼是否匹配
    if (password.value !== confirmPassword.value) {
      throw new Error('密碼不匹配')
    }

    // 使用 Supabase 註冊新用戶
    const { data: authData, error: authError } = await supa.auth.signUp({
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

    // 註冊成功後顯示提示訊息
    alert('註冊成功！請檢查您的電子郵件以驗證您的帳戶。')
    
    // 跳轉到登入頁面
    router.push('/login')
  } catch (error) {
    console.error('註冊錯誤:', error.message)
    alert('註冊失敗: ' + error.message)
  }
}
</script>
