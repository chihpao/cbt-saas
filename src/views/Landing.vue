<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'

const router = useRouter()
const user = ref(null)

const steps = [
  {
    emoji: '📝',
    title: '拆解任務',
    description: '將大目標分解為可行的小步驟'
  },
  {
    emoji: '⏰',
    title: '安排時間',
    description: '為每個步驟設定明確的執行時間'
  },
  {
    emoji: '📊',
    title: '追蹤進度',
    description: '記錄完成情況並獲得即時反饋'
  }
]

const features = [
  {
    emoji: '🧠',
    title: '認知行為療法',
    description: '基於科學驗證的 CBT 方法，幫助你改變思維模式，提升執行力。'
  },
  {
    emoji: '📱',
    title: '隨時隨地使用',
    description: '響應式設計，在手機、平板或電腦上都能順暢使用。'
  },
  {
    emoji: '🔒',
    title: '隱私保護',
    description: '你的數據安全是我們的首要任務，所有資料都會被加密保護。'
  }
]

// 檢查用戶是否已登入
const checkAuth = async () => {
  user.value = await getCurrentUser()
}

// 處理登出
const handleSignOut = async () => {
  try {
    await signOut()
    user.value = null
    router.push('/')
  } catch (error) {
    console.error('登出錯誤:', error.message)
  }
}

const scrollToFeatures = () => {
  const element = document.getElementById('features')
  element?.scrollIntoView({ behavior: 'smooth' })
}

// 組件掛載時檢查登入狀態
onMounted(() => {
  checkAuth()
  
  // 監聽認證狀態變化
  const { data: { subscription } } = supa.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
  
  // 組件卸載時取消訂閱
  return () => {
    subscription?.unsubscribe()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 導航欄 -->
    <header class="px-6 py-4 bg-white shadow-sm">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold text-indigo-600">CBT 小幫手</h1>
        <div v-if="user" class="flex items-center space-x-4">
          <span class="text-sm text-gray-700">歡迎, {{ user.email }}</span>
          <button 
            @click="handleSignOut" 
            class="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            登出
          </button>
        </div>
        <div v-else class="flex space-x-3">
          <button 
            @click="$router.push('/login')" 
            class="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            登入
          </button>
          <button 
            @click="$router.push('/register')" 
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            註冊
          </button>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="flex-1">
      <!-- 英雄區域 -->
      <section class="px-6 py-12 md:py-20 bg-gradient-to-br from-indigo-50 to-white">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            把不容易的事，<br class="sm:hidden">變得有步驟
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            用科學方法拆解任務，降低焦慮，提升執行力
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              @click="$router.push('/tasks')"
              class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              立即開始
            </button>
            <button
              @click="scrollToFeatures"
              class="px-8 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              了解更多
            </button>
          </div>
          
          <!-- 插圖區域 -->
          <div class="relative max-w-3xl mx-auto">
            <div class="relative z-10 p-8 bg-white rounded-2xl shadow-lg">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="(step, index) in steps" :key="index" class="p-4 rounded-xl bg-indigo-50">
                  <div class="text-3xl mb-3">{{ step.emoji }}</div>
                  <h3 class="font-semibold text-gray-800 mb-2">{{ step.title }}</h3>
                  <p class="text-sm text-gray-600">{{ step.description }}</p>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full opacity-70"></div>
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-purple-100 rounded-full opacity-70"></div>
          </div>
        </div>
      </section>

      <!-- 功能特色 -->
      <section id="features" class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-12">為什麼選擇 CBT 小幫手？</h2>
          
          <div class="space-y-10">
            <div v-for="(feature, index) in features" :key="index" 
                 class="flex flex-col md:flex-row gap-6 items-center">
              <div :class="{'md:order-2': index % 2 === 1}" class="flex-shrink-0">
                <div class="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
                  {{ feature.emoji }}
                </div>
              </div>
              <div :class="{'md:text-right': index % 2 === 1}">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
                <p class="text-gray-600">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 頁腳 -->
    <footer class="py-8 bg-white border-t">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center text-sm text-gray-500">
          <p>© {{ new Date().getFullYear() }} CBT 小幫手. 版權所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 添加平滑滾動效果 */
html {
  scroll-behavior: smooth;
}
</style>
  
