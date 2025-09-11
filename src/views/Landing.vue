<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import IconBrain from '@/components/icons/IconBrain.vue'
import IconDevices from '@/components/icons/IconDevices.vue'
import IconShield from '@/components/icons/IconShield.vue'

const router = useRouter()
const user = ref(null)

const steps = [
  { emoji: '🎯', title: '挑選任務', description: '從範例或自訂活動中，選擇能帶來愉悅與價值感的行動' },
  { emoji: '⏰', title: '設定時間', description: '將活動排入行程，設定提醒，幫助你真的去做' },
  { emoji: '🧠', title: '完成與反思', description: '完成後簡單記錄心情變化，累積屬於你的正向能量' }
]

const features = [
  { icon: 'brain',  title: '行為活化方法', description: '以科學實證的 CBT 技術──行為活化，幫助你逐步恢復動力，找回積極生活感。' },
  { icon: 'device', title: '隨時隨地使用', description: '響應式設計，手機、平板與桌面裝置皆能順暢體驗。' },
  { icon: 'shield', title: '隱私保護',     description: '你的資料只屬於你，我們以最高標準保護隱私與安全。' }
]

const iconMap = computed(() => ({ brain: IconBrain, device: IconDevices, shield: IconShield }))

const checkAuth = async () => { user.value = await getCurrentUser() }
const handleSignIn = async () => {
  const isProduction = window.location.hostname === 'cbt-saas.vercel.app'
  const redirectTo = isProduction 
    ? 'https://cbt-saas.vercel.app/auth/callback'
    : 'http://localhost:3000/auth/callback'
    
  await supa.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo
    }
  })
}

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
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) 
}

onMounted(() => {
  checkAuth()
  
  // 監聽認證狀態變化
  const { data: { subscription } } = supa.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
  
  // 組件卸載時取消訂閱
  return () => {
    subscription?.unsubscribe?.()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="px-6 py-4 bg-white shadow-sm">
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <img src="/logo.svg" alt="CBT 小幫手" class="h-6 w-6"/>
          <span class="text-xl font-bold text-indigo-600">CBT 小幫手</span>
        </div>
        <div v-if="user" class="flex items-center space-x-4">
          <span class="text-sm text-gray-700">已登入：{{ user.email }}</span>
          <button @click="handleSignOut" class="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg">登出</button>
        </div>
        <div v-else class="flex space-x-3">
          <button @click="$router.push('/login')" class="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg">登入</button>
          <button @click="$router.push('/register')" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">註冊</button>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="flex-1">
      <!-- Hero -->
      <section class="px-6 py-12 md:py-20 bg-gradient-to-br from-indigo-50 to-white">
        <div class="max-w-5xl mx-auto text-center">
          <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            從小行動開始，活化你的生活
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            透過行為活化（Behavioral Activation, BA）與 CBT 引導，安排正向、有意義的活動，<br>幫助你打破情緒低落的惡性循環。
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button @click="$router.push('/tasks')" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">立刻開始</button>
            <button @click="scrollToFeatures" class="px-8 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg">了解更多</button>
          </div>

          <div class="relative max-w-4xl mx-auto">
            <div class="relative z-10 p-6 md:p-8 bg-white rounded-2xl shadow-lg">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="(step, index) in steps" :key="index" class="p-4 rounded-xl bg-indigo-50">
                  <div class="text-3xl mb-3">{{ step.emoji }}</div>
                  <h3 class="font-semibold text-gray-800 mb-2">{{ step.title }}</h3>
                  <p class="text-sm text-gray-600">{{ step.description }}</p>
                </div>
              </div>
            </div>
            <div class="pointer-events-none absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full opacity-70"></div>
            <div class="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-purple-100 rounded-full opacity-70"></div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-16 bg-white">
        <div class="max-w-5xl mx-auto px-6">
          <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">為什麼選擇 CBT 小幫手？</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="(feature, index) in features" :key="index" class="flex gap-4 items-start">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <component :is="iconMap[feature.icon]" class="w-7 h-7" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="py-8 bg-white border-t">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center text-sm text-gray-500">
          <p>© {{ new Date().getFullYear() }} CBT 小幫手. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html { scroll-behavior: smooth; }
</style>
  
