<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { completeWithCBT, getOrCreateUser, scheduleTask, getPendingRecords, listTasks } from '@/services/supabaseApi'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconClock from '@/components/icons/IconClock.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const recordIdQuery = computed(() => route.query.record_id || null)

// View State: 'loading', 'list', 'form', 'empty'
const viewMode = ref('loading')

// Data
const pendingTasks = ref([])
const selectedRecord = ref(null) // The record being completed
const task = ref(null)           // The task definition (title, category)

// Form Data
const scoreBefore = ref(5) 
const scoreAfter = ref(3)  
const thoughtBefore = ref('')
const thoughtAfter = ref('')
const err = ref('')

onMounted(async () => {
  try {
    // 1. Restore User ID
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) { 
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

    // 2. Determine Initial State
    if (recordIdQuery.value) {
      // Direct link to a specific record
      await loadRecordForForm(recordIdQuery.value)
    } else {
      // Load list of pending tasks
      await loadPendingList()
    }
  } catch (e) {
    err.value = e?.message || String(e)
    viewMode.value = 'empty'
  }
})

async function loadPendingList() {
  viewMode.value = 'loading'
  try {
    const [records, allTasks] = await Promise.all([
      getPendingRecords(store.userId),
      listTasks()
    ])

    // Join records with task details
    const joined = records.map(r => {
      const t = allTasks.find(at => at.task_id == r.task_id) // Loose equality for UUID vs Int string mix
      return {
        ...r,
        task_title: t ? t.title : '未知任務',
        task_category: t ? t.category : '其他'
      }
    })

    if (joined.length > 0) {
      pendingTasks.value = joined
      viewMode.value = 'list'
    } else {
      // No pending records found. Check for "Ghost" task (Immediate flow)
      const ghostRaw = localStorage.getItem('selected_task')
      if (ghostRaw) {
        task.value = JSON.parse(ghostRaw)
        selectedRecord.value = null // Will create new record on submit
        viewMode.value = 'form'
      } else {
        viewMode.value = 'empty'
      }
    }
  } catch (e) {
    console.error(e)
    err.value = '無法讀取待辦事項'
  }
}

async function loadRecordForForm(rid) {
  viewMode.value = 'loading'
  try {
    // We need to fetch the record details.
    // Since getPendingRecords returns all, we can reuse it or implement getRecord(id).
    // Let's reuse getPendingRecords for simplicity and filter locally.
    const records = await getPendingRecords(store.userId)
    const r = records.find(x => x.record_id == rid)
    
    if (r) {
      // Found it
      const allTasks = await listTasks()
      const t = allTasks.find(at => at.task_id == r.task_id)
      
      selectedRecord.value = r
      task.value = t || { title: '未知任務', category: '其他' }
      viewMode.value = 'form'
    } else {
      // Not found in pending list (maybe already completed?)
      // Check if we can just load task info from localStorage if it matches?
      // No, strictly follow the ID.
      err.value = '找不到指定的待辦紀錄，可能已經完成或不存在。'
      viewMode.value = 'empty'
    }
  } catch (e) {
    err.value = '讀取紀錄失敗'
  }
}

function selectTask(record) {
  selectedRecord.value = record
  task.value = { title: record.task_title, category: record.task_category }
  viewMode.value = 'form'
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit', month: 'numeric', day: 'numeric' })
}

async function onSubmit() {
  if (!store.userId) return alert('無法辨識使用者身分')
  
  try {
    let finalRecordId = selectedRecord.value?.record_id

    // If "Ghost" task (Immediate Completion), create schedule record first
    if (!finalRecordId) {
      if (!task.value?.task_id) throw new Error('任務資訊不完整')
      
      const nowISO = new Date().toISOString()
      finalRecordId = await scheduleTask(
        store.userId, 
        task.value.task_id, 
        nowISO, 
        []
      )
    }

    await completeWithCBT(store.userId, finalRecordId, {
        thought_before: thoughtBefore.value,
        anxiety_before: scoreBefore.value,
        anxiety_after: scoreAfter.value,
        feeling_after: thoughtAfter.value
    })

    // Clear ghost state just in case
    localStorage.removeItem('selected_task')
    localStorage.removeItem('scheduled_time')
    localStorage.removeItem('last_record_id')
    store.resetFlow()

    alert('已提交完成紀錄！')
    router.push('/dashboard') 
  } catch (e) {
    console.error(e)
    alert('提交失敗：' + (e?.message || e))
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      
      <!-- Header -->
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl font-bold text-gray-900">完成紀錄</h1>
        <div class="h-1 w-16 bg-indigo-500 rounded mt-2 mx-auto md:mx-0"></div>
        <p class="mt-2 text-gray-500">
          <span v-if="viewMode === 'list'">選擇一個您已經完成的任務。</span>
          <span v-else-if="viewMode === 'form'">記錄下你的感受與想法。</span>
          <span v-else>尚無待辦事項。</span>
        </p>
      </div>

      <p v-if="err" class="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{{ err }}</p>

      <!-- Loading State -->
      <div v-if="viewMode === 'loading'" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-500"></div>
        <p class="mt-2 text-gray-400 text-sm">讀取中...</p>
      </div>

      <!-- List Mode -->
      <div v-else-if="viewMode === 'list'" class="space-y-4">
        <div 
          v-for="item in pendingTasks" 
          :key="item.record_id"
          class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex items-center justify-between"
          @click="selectTask(item)"
        >
          <div class="flex items-center gap-4">
             <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
               <IconCheckCircle class="w-5 h-5" />
             </div>
             <div>
               <h3 class="font-bold text-gray-800">{{ item.task_title }}</h3>
               <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                 <IconClock class="w-3 h-3" />
                 <span>{{ formatTime(item.scheduled_time) }}</span>
                 <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{{ item.task_category }}</span>
               </div>
             </div>
          </div>
          <svg class="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>

      <!-- Form Mode -->
      <div v-else-if="viewMode === 'form'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        <!-- Task Header -->
        <div class="border-b border-gray-100 pb-6 flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-1">
              {{ task?.title || '未知任務' }}
            </h2>
            <p class="text-sm text-gray-500">
              類別：<span class="text-indigo-600 font-medium">{{ task?.category || '—' }}</span>
            </p>
          </div>
          <button v-if="!recordIdQuery" @click="viewMode = 'list'; loadPendingList()" class="text-xs text-gray-400 hover:text-gray-600 underline">
            切換任務
          </button>
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
              v-if="!recordIdQuery"
              type="button" 
              class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
              @click="viewMode = 'list'"
            >
              返回列表
            </button>
             <button 
              v-else
              type="button" 
              class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
              @click="$router.push('/dashboard')"
            >
              取消
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

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
         <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
           <IconCheckCircle class="w-8 h-8" />
         </div>
         <p class="text-gray-500 font-medium text-lg">目前沒有進行中的任務</p>
         <p class="text-gray-400 text-sm mt-1 mb-6">好樣的！你已經完成了所有計畫。</p>
         <button 
           @click="$router.push('/tasks')"
           class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow transition-all"
         >
           安排新任務
         </button>
      </div>

    </div>
  </AppLayout>
</template>