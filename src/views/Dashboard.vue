<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { stats, getOrCreateUser, getRecentCompletedRecords, getPendingRecords } from '../services/supabaseApi'
import AnxietyChart from '@/components/dashboard/AnxietyChart.vue'
import InsightPanel from '@/components/dashboard/InsightPanel.vue'
import OnboardingModal from '@/components/common/OnboardingModal.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconTrendDown from '@/components/icons/IconTrendDown.vue'
import type { Stats, TaskRecord } from '@/types'

const store = useAppStore()
const s = ref<Stats>({ planned: 0, completed: 0, avg_relief: 0 })
const recentRecords = ref<TaskRecord[]>([])
const pendingCount = ref(0)
const loading = ref(true)
const err = ref('')

onMounted(async () => {
  try {
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) {
        anon = uuid()
        localStorage.setItem('anon_id', anon)
      }
      store.userId = await getOrCreateUser(anon)
    }
    
    const [statsData, records, pending] = await Promise.all([
      stats(store.userId),
      getRecentCompletedRecords(store.userId),
      getPendingRecords(store.userId)
    ])
    s.value = statsData
    recentRecords.value = records
    pendingCount.value = pending.length
  } catch (e: any) {
    err.value = e?.message || String(e)
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <OnboardingModal />
    
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-40 bg-gray-100 rounded-[2rem] animate-pulse"></div>
      </div>

      <div v-else>
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Planned -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(59,130,246,0.1)] hover:-translate-y-1 transition-all duration-500">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4 text-blue-600">
                <div class="p-2 bg-blue-50 rounded-xl"><IconCalendar class="w-5 h-5" /></div>
                <span class="text-xs font-bold uppercase tracking-wider opacity-70">計畫中</span>
              </div>
              <h3 class="text-4xl font-black text-gray-900 tracking-tighter">{{ s.planned }}</h3>
            </div>
          </div>

          <!-- Completed -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(34,197,94,0.1)] hover:-translate-y-1 transition-all duration-500">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4 text-green-600">
                <div class="p-2 bg-green-50 rounded-xl"><IconCheckCircle class="w-5 h-5" /></div>
                <span class="text-xs font-bold uppercase tracking-wider opacity-70">已完成</span>
              </div>
              <h3 class="text-4xl font-black text-gray-900 tracking-tighter">{{ s.completed }}</h3>
            </div>
          </div>

          <!-- Relief -->
          <div class="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-500">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4 text-indigo-600">
                <div class="p-2 bg-indigo-50 rounded-xl"><IconTrendDown class="w-5 h-5" /></div>
                <span class="text-xs font-bold uppercase tracking-wider opacity-70">焦慮減輕</span>
              </div>
              <h3 class="text-4xl font-black text-gray-900 tracking-tighter flex items-baseline">
                {{ s.avg_relief }} <span class="text-lg text-gray-300 font-bold ml-1">avg</span>
              </h3>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chart Section -->
          <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[400px]">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-lg font-bold text-gray-900">情緒趨勢</h2>
            </div>
            <div class="h-[300px]">
              <AnxietyChart :records="recentRecords" />
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Pending Tasks Widget -->
            <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 cursor-pointer" @click="$router.push('/complete')">
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-white/10 rounded-xl backdrop-blur-sm"><IconCheckCircle class="w-5 h-5 text-white" /></div>
                  <span class="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">{{ pendingCount }} 待辦</span>
                </div>
                <h3 class="text-xl font-bold mb-1">準備好行動了嗎？</h3>
                <p class="text-indigo-100 text-sm opacity-80 mb-6">每一個小任務都是改變的開始。</p>
                <div class="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                  前往反思 
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
              <!-- Decor -->
              <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            </div>

            <!-- Insights -->
            <InsightPanel :records="recentRecords" />
          </div>
        </div>
            </div>
          </div>
        </div>
      </template>
      