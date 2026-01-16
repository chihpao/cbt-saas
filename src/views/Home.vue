<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/services/supaClient'
import { getPendingRecords, stats } from '@/services/supabaseApi'
import type { User } from '@supabase/supabase-js'
import type { TaskRecord, Stats } from '@/types'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconClock from '@/components/icons/IconClock.vue'
import IconTrendDown from '@/components/icons/IconTrendDown.vue'

const router = useRouter()
const user = ref<User | null>(null)
const pendingTasks = ref<TaskRecord[]>([])
const userStats = ref<Stats>({ planned: 0, completed: 0, avg_relief: 0 })
const loading = ref(true)

const todayDate = new Date().toLocaleDateString('zh-TW', { 
  month: 'long', 
  day: 'numeric', 
  weekday: 'long' 
})

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? '早安' : h < 18 ? '午安' : '晚安'
})

// 模擬進度條數據 (可以之後換成真實計算)
const weeklyProgress = computed(() => {
  const total = userStats.value.planned + userStats.value.completed
  if (total === 0) return 0
  return Math.round((userStats.value.completed / total) * 100)
})

onMounted(async () => {
  try {
    user.value = await getCurrentUser()
    if (user.value) {
      const [pending, statData] = await Promise.all([
        getPendingRecords(user.value.id),
        stats(user.value.id)
      ])
      pendingTasks.value = pending
      userStats.value = statData
    }
  } catch (e) {
    console.error('Home data load error', e)
  } finally {
    loading.value = false
  }
})

const priorityLabel = (p: number) => {
  if (p >= 8) return { text: '高', class: 'bg-orange-100 text-orange-700' }
  if (p >= 5) return { text: '中', class: 'bg-blue-50 text-blue-700' }
  return { text: '低', class: 'bg-gray-100 text-gray-600' }
}
</script>

<template>
  <div class="max-w-5xl mx-auto animate-in fade-in duration-500">
    
    <!-- Header: Minimalist & Clean -->
    <header class="flex items-end justify-between mb-8 pb-6 border-b border-gray-100">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">
          {{ greeting }}，{{ user?.email?.split('@')[0] }}
        </h1>
        <p class="text-gray-500 mt-1 text-sm font-medium">{{ todayDate }}</p>
      </div>
      <div class="hidden md:block text-right">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">本週專注</div>
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          保持覺察
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Main Column: Today's Agenda (Task List) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
            <IconCheckCircle class="w-5 h-5 text-gray-400" />
            待辦事項
          </h2>
          <button 
            @click="router.push('/tasks')" 
            class="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
          >
            管理任務 &rarr;
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 bg-gray-50 rounded-lg animate-pulse border border-gray-100"></div>
        </div>

        <!-- Task List -->
        <div v-else-if="pendingTasks.length > 0" class="space-y-3">
          <div 
            v-for="task in pendingTasks.slice(0, 5)" 
            :key="task.record_id"
            class="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all duration-200 cursor-default"
          >
            <div class="flex items-start gap-4">
              <!-- Checkbox (Visual only) -->
              <div class="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 transition-colors"></div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-indigo-900 transition-colors">
                  {{ task.task?.title || '未命名任務' }}
                </h3>
                <div class="flex items-center gap-3 mt-1.5">
                  <span 
                    v-if="task.anxiety_before"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded border border-transparent"
                    :class="priorityLabel(task.anxiety_before).class"
                  >
                    預期焦慮 {{ task.anxiety_before }}
                  </span>
                  <span v-if="task.created_at" class="text-xs text-gray-400 flex items-center gap-1">
                    <IconClock class="w-3 h-3" />
                    {{ new Date(task.created_at).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>

            <button 
              @click="router.push('/complete')"
              class="opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95"
            >
              開始
            </button>
          </div>
          
          <div v-if="pendingTasks.length > 5" class="text-center pt-2">
            <span class="text-xs text-gray-400">還有 {{ pendingTasks.length - 5 }} 項任務...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <IconCheckCircle class="w-6 h-6 text-emerald-500" />
          </div>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">今日任務已清空</h3>
          <p class="text-xs text-gray-500 max-w-xs text-center mb-6">太棒了！你已經完成了所有待辦事項。好好休息，或者規劃明天的行程。</p>
          <button 
            @click="router.push('/tasks')"
            class="text-xs bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            新增任務
          </button>
        </div>
      </div>

      <!-- Side Column: Stats & Insights -->
      <div class="space-y-6">
        
        <!-- Weekly Overview Card -->
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">本週概覽</h3>
          
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-3xl font-bold text-gray-900">{{ userStats.completed }}</span>
            <span class="text-xs text-gray-500">項已完成</span>
          </div>
          
          <!-- Simple Progress Bar -->
          <div class="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
            <div class="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" :style="{ width: `${weeklyProgress}%` }"></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <div class="text-[10px] text-gray-400 mb-1">計畫中</div>
              <div class="text-lg font-semibold text-gray-900">{{ userStats.planned }}</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-400 mb-1">焦慮減輕 (平均)</div>
              <div class="text-lg font-semibold text-emerald-600 flex items-center gap-1">
                <IconTrendDown class="w-4 h-4" />
                {{ userStats.avg_relief }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quote / Insight (Minimalist) -->
        <div class="bg-gray-900 text-white p-6 rounded-xl relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          </div>
          <p class="text-sm font-medium leading-relaxed opacity-90 relative z-10">
            "情緒不是事實。它們只是心智對當下情況的暫時反應。"
          </p>
          <div class="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">每日箴言</div>
        </div>

      </div>
    </div>
  </div>
</template>


