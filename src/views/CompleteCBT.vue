<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { useNotificationStore } from '@/stores/notification'
import {
  completeWithCBT,
  getOrCreateUser,
  scheduleTask,
  getPendingRecords,
  listTasks,
  ensureCurrentUser
} from '@/services/supabaseApi'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import type { TaskRecord, Task, JoinedTaskRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const notification = useNotificationStore()

const recordIdQuery = computed(() => route.query.record_id || null)

// View State: 'loading', 'list', 'form', 'empty'
const viewMode = ref<'loading' | 'list' | 'form' | 'empty'>('loading')

// Data
const pendingTasks = ref<JoinedTaskRecord[]>([])
const selectedRecord = ref<TaskRecord | null>(null) // The record being completed
const task = ref<Partial<Task> | null>(null) // The task definition (title, category)

// Form Data
const scoreBefore = ref(5)
const scoreAfter = ref(3)
const thoughtBefore = ref('')
const thoughtAfter = ref('')
const selectedDistortions = ref<string[]>([])

const distortions = [
  { id: 'all_or_nothing', label: '非黑即白', desc: '視事情為絕對的成功或失敗，沒有中間地帶。' },
  { id: 'catastrophizing', label: '災難化思考', desc: '預期最壞的結果會發生，並誇大其後果。' },
  { id: 'emotional_reasoning', label: '情緒化推理', desc: '認為當下的感受反映了事實真相（覺得笨就是笨）。' },
  { id: 'mind_reading', label: '讀心術', desc: '未經查證就認定別人在負面看待自己。' },
  { id: 'should_statements', label: '應該/必須', desc: '對自己或他人設下嚴苛的規則（我應該要...）。' },
  { id: 'personalization', label: '個人化', desc: '將不可控的外部事件歸咎於自己。' }
]

onMounted(async () => {
  console.log('[DEBUG] CompleteCBT Mounted')
  try {
    store.userId = await ensureCurrentUser()
    console.log('[DEBUG] Resolved User ID:', store.userId)

    if (recordIdQuery.value) {
      await loadRecordForForm(Number(recordIdQuery.value))
    } else {
      console.log('[DEBUG] Calling loadPendingList...')
      await loadPendingList()
    }
  } catch (e: unknown) {
    console.error('[DEBUG] Critical Error in onMounted:', e)
    viewMode.value = 'empty'
  }
})

async function loadPendingList() {
  viewMode.value = 'loading'
  try {
    console.log('[DEBUG] Loading Pending List for:', store.userId)
    
    // 1. Get Records
    const records = await getPendingRecords(store.userId)
    console.log('[DEBUG] Raw Records from DB:', records)

    // 2. Get Tasks Definition
    const allTasks = await listTasks()
    
    // 3. Join them
    let joined: JoinedTaskRecord[] = records.map((r) => {
      const t = allTasks.find((at) => String(at.task_id) === String(r.task_id))
      return {
        ...r,
        task_title: t ? t.title : `未知任務 (${r.task_id})`,
        task_category: t ? t.category : '其他'
      }
    })
    console.log('[DEBUG] Joined Data:', joined)

    if (joined.length > 0) {
      pendingTasks.value = joined
      viewMode.value = 'list'
    } else {
      console.warn('[DEBUG] No pending tasks found.')
      viewMode.value = 'empty'
    }
  } catch (e) {
    console.error('[DEBUG] Load Error:', e)
    viewMode.value = 'empty'
  }
}

async function loadRecordForForm(rid: number) {
  viewMode.value = 'loading'
  try {
    const records = await getPendingRecords(store.userId)
    const r = records.find((x) => x.record_id == rid)

    if (r) {
      const allTasks = await listTasks()
      const t = allTasks.find((at) => String(at.task_id) === String(r.task_id))
      selectedRecord.value = r
      task.value = t || { title: '未知任務', category: '其他' }
      viewMode.value = 'form'
    } else {
      viewMode.value = 'empty'
    }
  } catch (e) {
    viewMode.value = 'empty'
  }
}

function selectTask(record: JoinedTaskRecord) {
  selectedRecord.value = record
  task.value = { title: record.task_title, category: record.task_category }
  viewMode.value = 'form'
}

async function onSubmit() {
  if (!store.userId) return
  try {
    let finalRecordId = selectedRecord.value?.record_id
    if (!finalRecordId || finalRecordId === -1) {
      if (!task.value?.task_id) throw new Error()
      const nowISO = new Date().toISOString()
      finalRecordId = await scheduleTask(store.userId, task.value.task_id, nowISO, [])
    }
    await completeWithCBT(store.userId, finalRecordId || -1, {
      thought_before: thoughtBefore.value,
      anxiety_before: scoreBefore.value,
      anxiety_after: scoreAfter.value,
      feeling_after: thoughtAfter.value,
      distortions: selectedDistortions.value
    })
    localStorage.removeItem('selected_task')
    localStorage.removeItem('scheduled_time')
    store.resetFlow()
    notification.show('已完成反思', 'success')
    router.push('/dashboard')
  } catch (e: any) {
    console.error('Submit Error:', e)
    notification.show('提交失敗: ' + (e.message || '未知錯誤'), 'error')
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Loading -->
      <div v-if="viewMode === 'loading'" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>

      <!-- List Mode -->
      <div v-else-if="viewMode === 'list'" class="space-y-4">
        <!-- DEBUG DUMP -->
        <pre class="bg-gray-100 p-2 text-xs rounded hidden">{{ pendingTasks }}</pre>

        <div
          v-for="item in pendingTasks"
          :key="item.record_id"
          class="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-indigo-200 transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.98]"
          @click="selectTask(item)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <IconCheckCircle class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-black text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{{ item.task_title }}</h3>
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-400 transition-colors">{{ item.task_category }}</span>
              </div>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
               <div class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">開始反思</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Mode -->
      <div v-else-if="viewMode === 'form'" class="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-white space-y-12">
        <div class="flex items-center justify-between">
            <h2 class="text-3xl font-black text-gray-900 tracking-tight">{{ task?.title }}</h2>
            <button @click="loadPendingList" class="text-gray-400 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-12">
          <!-- Sliders Section -->
          <div class="space-y-10">
            <!-- Score Before -->
            <div class="space-y-4">
               <div class="flex items-center justify-between">
                <label class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">執行前焦慮</label>
                <span class="text-3xl font-black font-mono text-indigo-600">{{ scoreBefore }}</span>
              </div>
              <input type="range" min="0" max="10" step="1" v-model.number="scoreBefore" class="w-full accent-indigo-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
            </div>

            <!-- Score After -->
             <div class="space-y-4">
               <div class="flex items-center justify-between">
                <label class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">執行後焦慮</label>
                <span class="text-3xl font-black font-mono text-emerald-500">{{ scoreAfter }}</span>
              </div>
              <input type="range" min="0" max="10" step="1" v-model.number="scoreAfter" class="w-full accent-emerald-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>

          <!-- Thought Before -->
          <div>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">當時的想法</label>
            <textarea 
              v-model="thoughtBefore" 
              rows="3" 
              placeholder="當時腦中閃過了什麼念頭？"
              class="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-gray-200 focus:bg-white transition-all outline-none resize-none font-medium text-gray-700"
            ></textarea>
          </div>

          <!-- Distortions Section -->
          <div class="py-2 space-y-4">
            <div class="flex items-center gap-2">
               <span class="w-2 h-2 rounded-full bg-orange-400"></span>
               <label class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">你有注意到這些思考陷阱嗎？</label>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                v-for="d in distortions" 
                :key="d.id"
                @click="selectedDistortions.includes(d.id) ? selectedDistortions = selectedDistortions.filter(x => x !== d.id) : selectedDistortions.push(d.id)"
                class="p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-95 flex flex-col gap-1 relative overflow-hidden group"
                :class="selectedDistortions.includes(d.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200 bg-white'"
              >
                <div class="flex items-center justify-between relative z-10">
                  <span class="font-bold text-gray-900 transition-colors" :class="selectedDistortions.includes(d.id) ? 'text-indigo-700' : ''">{{ d.label }}</span>
                  <div class="transition-all duration-300" :class="selectedDistortions.includes(d.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'">
                    <div class="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 font-medium leading-relaxed relative z-10">{{ d.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Thought After -->
          <div>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">現在的感受</label>
             <textarea 
              v-model="thoughtAfter" 
              rows="3" 
              placeholder="做完這件事後，感覺如何？"
              class="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-gray-200 focus:bg-white transition-all outline-none resize-none font-medium text-gray-700"
            ></textarea>
          </div>

          <button type="submit" class="w-full py-5 rounded-[2rem] bg-gray-900 text-white font-black text-xl shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] hover:-translate-y-1">儲存反思</button>
        </form>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-24">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCheckCircle class="w-10 h-10 text-gray-200" />
        </div>
        <p class="text-gray-400 font-bold">目前沒有待處理的任務</p>
        <button @click="$router.push('/tasks')" class="mt-8 text-indigo-600 font-black hover:underline">去安排一個？</button>
      </div>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>