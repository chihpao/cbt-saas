<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import IconBrain from '@/components/icons/IconBrain.vue'
import IconDevices from '@/components/icons/IconDevices.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconTaskList from '@/components/icons/IconTaskList.vue'
import IconClock from '@/components/icons/IconClock.vue'
import IconReflection from '@/components/icons/IconReflection.vue'
import type { User } from '@supabase/supabase-js'

const router = useRouter()
const user = ref<User | null>(null)

const steps = [
  {
    icon: 'tasks',
    title: '挑選任務',
    description: '選擇符合當下需求的任務，讓活動變得清楚設定可行。'
  },
  {
    icon: 'clock',
    title: '設定時間',
    description: '將活動安排進日程，為這段屬於自己的時間預留空間。'
  },
  {
    icon: 'reflection',
    title: '完成反思',
    description: '完成後記錄感受與收穫，檢視進度並調整下一步。'
  }
]

const features = [
  {
    icon: 'brain',
    title: '行為活化引導',
    description: '以科學實證的 CBT 技術引導行為活化，幫助你逐步恢復活力，找回積極的生活。'
  },
  {
    icon: 'device',
    title: '隨時隨地使用',
    description: '響應式設計，讓你在手機、平板、桌面裝置都能流暢體驗。'
  },
  {
    icon: 'shield',
    title: '隱私保護',
    description: '你的資料屬於你，我們以最高標準保護隱私與安全。'
  }
]

const iconMap = computed(() => ({
  brain: IconBrain,
  device: IconDevices,
  shield: IconShield,
  tasks: IconTaskList,
  clock: IconClock,
  reflection: IconReflection
}))

const checkAuth = async () => {
  user.value = await getCurrentUser()
}

const handleSignOut = async () => {
  try {
    await signOut()
    user.value = null
    router.push('/')
  } catch (error: any) {
    console.error('登出錯誤:', error.message)
  }
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  checkAuth()

  // 監聽認證狀態變更
  const {
    data: { subscription }
  } = supa.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })

  // 組件卸載時取消訂閱
  return () => {
    subscription.unsubscribe()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-700">
    <!-- Header -->
    <header class="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2 group cursor-default">
          <img src="/logo.svg" alt="CBT 小幫手" class="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
          <span class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">CBT 小幫手</span>
        </div>
        <div v-if="user" class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-600 hidden sm:inline">{{ user.email }}</span>
          <button
            @click="handleSignOut"
            class="px-5 py-2 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95"
          >
            登出
          </button>
        </div>
        <div v-else class="flex gap-3">
          <button
            @click="$router.push('/login')"
            class="px-5 py-2 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95"
          >
            登入
          </button>
          <button
            @click="$router.push('/register')"
            class="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            免費註冊
          </button>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="flex-1">
      <!-- Hero -->
      <section class="relative px-6 py-20 md:py-32 overflow-hidden">
        <!-- Background Blobs -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div class="max-w-5xl mx-auto text-center relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">科學實證的焦慮緩解方案</span>
          </div>

          <h1 class="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-[1.15] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            從微小行動開始，<br class="hidden md:block" />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">活出想要的生活</span>
          </h1>
          
          <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            不只是記錄，而是改變。結合行為活化 (BA) 與認知行為治療 (CBT) 技術，陪伴你打破焦慮循環，找回生活的掌控權。
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button
              @click="$router.push('/tasks')"
              class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all active:scale-95 hover:-translate-y-1"
            >
              開始第一次練習
            </button>
            <button
              @click="scrollToFeatures"
              class="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 text-lg font-bold rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              深入了解原理
            </button>
          </div>

          <!-- Cards Preview -->
          <div class="relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-20"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div
                v-for="(step, index) in steps"
                :key="index"
                class="group p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div class="flex flex-col items-center text-center gap-4">
                  <div
                    class="w-14 h-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 transition-colors duration-300 flex items-center justify-center text-indigo-600 group-hover:text-white"
                  >
                    <component :is="iconMap[step.icon as keyof typeof iconMap]" class="w-7 h-7" />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
                    <p class="text-sm text-gray-500 leading-relaxed">{{ step.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-24 bg-white relative">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              為什麼選擇 CBT 小幫手？
            </h2>
            <p class="text-gray-500 max-w-2xl mx-auto">我們專注於將複雜的心理學理論，轉化為簡單、可執行的日常工具。</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(feature, index) in features" :key="index" class="p-6 rounded-3xl hover:bg-gray-50 transition-colors duration-300">
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <component
                  :is="iconMap[feature.icon as keyof typeof iconMap]"
                  class="w-6 h-6"
                />
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
              <p class="text-gray-500 leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="py-8 bg-white border-t">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center text-sm text-gray-500">
          <p>© {{ new Date().getFullYear() }} CBT 小幫手 All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>