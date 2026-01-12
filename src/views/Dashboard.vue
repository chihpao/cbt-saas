<script setup>
import { onMounted, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { stats, getOrCreateUser } from '../services/supabaseApi'
import AppLayout from '@/components/layout/AppLayout.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconTrendDown from '@/components/icons/IconTrendDown.vue'

const store = useAppStore()
const s = ref({ planned: 0, completed: 0, avg_relief: 0 })
const loading = ref(true)
const err = ref('')

onMounted(async () => {
  try {
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) { anon = uuid(); localStorage.setItem('anon_id', anon) }
      store.userId = await getOrCreateUser(anon)
    }
    s.value = await stats(store.userId)
  } catch (e) {
    err.value = e?.message || String(e)
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-8">
      <div class="text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">我的儀表板</h1>
        <p class="mt-2 text-gray-500 max-w-lg">追蹤你的 CBT 練習進度，每一次的行動都是改變的開始。</p>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="inline-block relative">
           <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
        </div>
        <p class="mt-4 text-gray-400 text-sm font-medium tracking-wide">正在同步數據...</p>
      </div>

      <div v-else>
        <p v-if="err" class="text-red-600 text-sm mb-6 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          {{ err }}
        </p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <!-- Planned Card -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-300">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <IconCalendar class="w-6 h-6" />
                </div>
                <span class="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-full">Planned</span>
              </div>
              
              <div>
                <h3 class="text-4xl font-extrabold text-gray-900 tracking-tighter">{{ s.planned }}</h3>
                <p class="text-sm font-medium text-gray-500 mt-1">已計畫任務</p>
              </div>
            </div>
          </div>

          <!-- Completed Card -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(34,197,94,0.1)] transition-all duration-300">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm">
                  <IconCheckCircle class="w-6 h-6" />
                </div>
                 <span class="text-xs font-semibold tracking-wider text-green-600 uppercase bg-green-50 px-2 py-1 rounded-full">Done</span>
              </div>
              
              <div>
                <h3 class="text-4xl font-extrabold text-gray-900 tracking-tighter">{{ s.completed }}</h3>
                <p class="text-sm font-medium text-gray-500 mt-1">已完成任務</p>
              </div>
            </div>
          </div>

          <!-- Anxiety Relief Card -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <IconTrendDown class="w-6 h-6" />
                </div>
                 <span class="text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-full">Relief</span>
              </div>
              
              <div>
                <h3 class="text-4xl font-extrabold text-gray-900 tracking-tighter flex items-baseline">
                  {{ s.avg_relief }}<span class="text-lg text-gray-400 font-semibold ml-1">分</span>
                </h3>
                <p class="text-sm font-medium text-gray-500 mt-1">平均焦慮減輕</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <button 
          class="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-[1px] shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.99]"
          @click="$router.push('/tasks')"
        >
          <div class="relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-5 rounded-2xl">
             <span class="text-lg font-bold text-white tracking-wide">安排新的行動</span>
             <svg class="w-5 h-5 text-white/80 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </div>
        </button>
      </div>
    </div>
  </AppLayout>
</template>
