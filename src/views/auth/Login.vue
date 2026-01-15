<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
      <div class="text-center">
        <img :src="logoUrl" alt="CBT 小幫手" class="h-10 w-10 mx-auto mb-4"/>
        <h2 class="text-2xl font-bold text-gray-900">歡迎回到 CBT 小幫手</h2>
        <p class="mt-2 text-sm text-gray-500">登入您的帳戶以繼續練習</p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- Google 登入按鈕 -->
        <div>
          <button @click="signInWithGoogle" class="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
            <img :src="googleIconUrl" alt="Google" class="w-5 h-5 mr-2" />
            使用 Google 帳號登入
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

        <!-- 電子郵件登入表單 -->
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="name@example.com">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
              <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="••••••">
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-600">
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
            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all">
              登入
            </button>
          </div>
        </form>
      </div>
      
      <div class="text-center text-sm">
        <span class="text-gray-600">還沒有帳號？</span>
        <button @click="$router.push('/register')" class="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
          立即註冊
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import googleIconUrl from '@/assets/google.svg?url'
import logoUrl from '@/assets/logo.svg?url'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supa } from '@/services/supaClient'

const email = ref('')
const password = ref('')
const router = useRouter()

const signInWithGoogle = async () => {
  try {
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  } catch (error: any) {
    console.error('Google 登入錯誤:', error.message)
    alert('Google 登入失敗: ' + error.message)
  }
}

const handleLogin = async () => {
  try {
    const { error } = await supa.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.push('/')
  } catch (error: any) {
    console.error('登入錯誤:', error.message)
    alert('登入失敗: ' + error.message)
  }
}
</script>