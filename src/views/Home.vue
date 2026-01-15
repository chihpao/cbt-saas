<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/services/supaClient'
import type { User } from '@supabase/supabase-js'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconTrendDown from '@/components/icons/IconTrendDown.vue'

const router = useRouter()
const user = ref<User | null>(null)
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
})

const feelings = [
  { icon: '😄', label: '很棒' },
  { icon: '🙂', label: '還好' },
  { icon: '😐', label: '平靜' },
  { icon: '😕', label: '有點糟' },
  { icon: '😫', label: '很糟' }
]
const selectedFeeling = ref<number | null>(null)

const selectFeeling = (index: number) => {
  selectedFeeling.value = index
  // 可以在這裡加入紀錄情緒的邏輯
  setTimeout(() => {
    // 簡單回饋動畫或提示
  }, 500)
}

onMounted(async () => {
  user.value = await getCurrentUser()
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Hero Section -->
    <section class="text-center pt-8 pb-4">
      <h1 class="text-4xl font-black text-gray-900 mb-2">
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{{ greeting }}</span>，{{ user?.email?.split('@')[0] }}
      </h1>
      <p class="text-gray-500 font-medium">今天想要專注在什麼事情上呢？</p>
    </section>

    <!-- Quick Check-in -->
    <section class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <h3 class="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-6">此刻的感受</h3>
      <div class="flex justify-between gap-2">
        <button 
          v-for="(f, idx) in feelings" 
          :key="idx"
          @click="selectFeeling(idx)"
          class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 group flex-1"
          :class="selectedFeeling === idx ? 'bg-indigo-50 scale-110 shadow-inner' : 'hover:bg-gray-50'"
        >
          <span class="text-3xl transition-transform group-hover:scale-110">{{ f.icon }}</span>
          <span class="text-[10px] font-bold text-gray-400 group-hover:text-gray-900">{{ f.label }}</span>
        </button>
      </div>
    </section>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button 
        @click="router.push('/tasks')"
        class="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-[2rem] text-left shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
      >
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
             <IconCheckCircle class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-black text-white mb-1">安排任務</h3>
          <p class="text-indigo-100 text-sm font-medium">設定一個小目標，開始行動</p>
        </div>
        <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      </button>

      <button 
        @click="router.push('/complete')"
        class="group relative overflow-hidden bg-white border border-gray-100 p-6 rounded-[2rem] text-left shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all hover:-translate-y-1 active:scale-95"
      >
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
             <IconTrendDown class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-black text-gray-900 mb-1">記錄反思</h3>
          <p class="text-gray-500 text-sm font-medium">檢視剛剛完成的活動與感受</p>
        </div>
      </button>
    </div>

    <!-- Quote -->
    <div class="text-center px-8">
      <p class="text-sm font-bold text-gray-400 italic">"不需要等到感覺變好才開始行動，行動會帶領感覺變好。"</p>
    </div>
  </div>
</template>
