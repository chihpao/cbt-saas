<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">登入您的帳戶</h2>
      </div>
      <div class="mt-8 space-y-6">
        <!-- Google 登入按鈕 -->
        <div>
          <button @click="signInWithGoogle" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <img :src="googleIconUrl" alt="Google" class="w-5 h-5 mr-2" />
            使用 Google 帳號登入
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

        <!-- 電子郵件登入表單 -->
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="sr-only">電子郵件</label>
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="電子郵件地址">
            </div>
            <div>
              <label for="password" class="sr-only">密碼</label>
              <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="密碼">
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                記住我
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                忘記密碼？
              </a>
            </div>
          </div>

          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              登入
            </button>
          </div>
        </form>
      </div>
      
      <div class="text-center text-sm">
        <span class="text-gray-600">還沒有帳號？</span>
        <button @click="$router.push('/register')" class="font-medium text-indigo-600 hover:text-indigo-500">
          立即註冊
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import googleIconUrl from '@/assets/google.svg?url'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supa } from '@/services/supaClient'

const email = ref('')
const password = ref('')
const router = useRouter()

// Google 登入
const signInWithGoogle = async () => {
  try {
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Google 登入錯誤:', error.message)
    alert('Google 登入失敗: ' + error.message)
  }
}

// 電子郵件登入
const handleLogin = async () => {
  try {
    const { error } = await supa.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    
    // 登入成功後重定向到首頁
    router.push('/')
  } catch (error) {
    console.error('登入錯誤:', error.message)
    alert('登入失敗: ' + error.message)
  }
}
</script>
