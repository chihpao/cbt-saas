<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { completeWithCBT, getOrCreateUser, scheduleTask } from '@/services/supabaseApi'
// import { saveCbtRecord /* etc. */ } from '@/services/supabaseApi'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const recordId = computed(() => route.query.record_id || null)

const task = ref(null) 
const source = ref('') 

const loading = ref(true)
const err = ref('')
const localRecordId = ref(null) // New ref to store recordId from localStorage

const scoreBefore = ref(5) 
const scoreAfter = ref(3)  
const thoughtBefore = ref('')
const thoughtAfter = ref('')

onMounted(async () => {
  try {
    loading.value = true
    
    // 1. Restore User ID
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) { 
        // Try to get from supa auth if logged in
        const user = await getOrCreateUser(null).catch(() => null)
        if (user) store.userId = user
        else {
           anon = uuid(); localStorage.setItem('anon_id', anon)
           store.userId = await getOrCreateUser(anon)
        }
      } else {
        store.userId = await getOrCreateUser(anon)
      }
    }

    // 2. Resolve Record ID (URL > LocalStorage)
    if (recordId.value) {
      localRecordId.value = recordId.value
      // Logic for fetching by recordId would go here (omitted for now as per original)
      const raw = localStorage.getItem('selected_task')
      if (raw) {
        task.value = JSON.parse(raw)
        source.value = 'db'
      } else {
        source.value = 'unknown'
      }
    } else {
      // Try to find last scheduled record
      const storedRid = localStorage.getItem('last_record_id')
      if (storedRid) {
        localRecordId.value = storedRid
      }

      const raw = localStorage.getItem('selected_task')
      if (raw) {
        task.value = JSON.parse(raw)
        source.value = 'local'
      } else {
        source.value = 'unknown'
      }
    }
  } catch (e) {
    err.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
})

function clamp01(x, min, max) {
  const n = Number(x)
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

async function onSubmit() {
  if (!store.userId) {
    // Try one last time
    try {
        const anon = localStorage.getItem('anon_id')
        if(anon) store.userId = await getOrCreateUser(anon)
    } catch(e) {}
    
    if(!store.userId) {
        alert('無法辨識使用者身分，請重新登入或重試')
        return
    }
  }
  
  if (!task.value && !localRecordId.value) {
    alert('找不到任務資訊，無法提交')
    return
  }

  try {
    let finalRecordId = localRecordId.value

    // If no recordId (Immediate Completion or from Nav), create a schedule record first (recorded as "now")
    if (!finalRecordId) {
      if (!task.value.task_id) throw new Error('任務資訊不完整 (缺少 task_id)')
      
      const nowISO = new Date().toISOString()
      finalRecordId = await scheduleTask(
        store.userId, 
        task.value.task_id, 
        nowISO, 
        [] // No notification needed for immediate completion
      )
      
      if (!finalRecordId) throw new Error('無法建立任務紀錄')
      console.log('Created immediate record:', finalRecordId)
    }

    await completeWithCBT(store.userId, finalRecordId, {
        thought_before: thoughtBefore.value,
        anxiety_before: scoreBefore.value,
        anxiety_after: scoreAfter.value,
        feeling_after: thoughtAfter.value
    })

    // Clear local state so "In Progress" doesn't show this task again
    localStorage.removeItem('selected_task')
    localStorage.removeItem('scheduled_time')
    localStorage.removeItem('last_record_id')
    store.resetFlow()

    alert('已提交完成紀錄！')
    router.push('/dashboard') 
  } catch (e) {
    console.error(e)
    alert('提交失敗（資料庫存取錯誤）：' + (e?.message || e))
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl font-bold text-gray-900">完成紀錄</h1>
        <div class="h-1 w-16 bg-indigo-500 rounded mt-2 mx-auto md:mx-0"></div>
        <p class="mt-2 text-gray-500">恭喜你完成任務！記錄下你的感受與想法。</p>
      </div>

      <p v-if="err" class="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{{ err }}</p>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-500"></div>
        <p class="mt-2 text-gray-400 text-sm">讀取中...</p>
      </div>

      <div v-else class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        <!-- Task Header -->
        <div class="border-b border-gray-100 pb-6">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">來源：{{ source || '—' }}</span>
             <span v-if="recordId" class="text-xs text-gray-300">#{{ recordId }}</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">
            {{ task?.title || '找不到任務資訊（可直接填寫）' }}
          </h2>
          <p class="text-sm text-gray-500">
            類別：<span class="text-indigo-600 font-medium">{{ task?.category || '—' }}</span>
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <!-- Scores -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">開始前的焦慮程度 (0-10)</label>
              <div class="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  v-model.number="scoreBefore"
                  class="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-xs">0 = 平靜, 10 = 極度焦慮</div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">完成後的焦慮程度 (0-10)</label>
              <div class="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  v-model.number="scoreAfter"
                  class="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Thoughts -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">完成前的想法</label>
            <textarea
              rows="3"
              v-model="thoughtBefore"
              class="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
              placeholder="例如：我擔心自己做不好、覺得很麻煩..."
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">完成後的想法</label>
            <textarea
              rows="3"
              v-model="thoughtAfter"
              class="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
              placeholder="例如：其實沒那麼難、感覺輕鬆多了..."
            />
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
              @click="$router.back()"
            >
              返回
            </button>
            <button 
              type="submit" 
              class="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              提交紀錄
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
