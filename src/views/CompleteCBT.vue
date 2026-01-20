<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useNotificationStore } from '@/stores/notification'
import {
  completeWithCBT,
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

const step = ref(1) // 1: List, 2: Anxiety Before, 3: Thought, 4: Distortions, 5: Outcome
const pendingTasks = ref<JoinedTaskRecord[]>([])
const selectedRecord = ref<TaskRecord | null>(null)
const task = ref<Partial<Task> | null>(null)
const loadingPending = ref(true)

// Form Data
const anxietyBefore = ref(5)
const anxietyAfter = ref(3)
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
  loadingPending.value = true
  store.userId = await ensureCurrentUser()
  await loadPendingList()
  
  if (route.query.record_id) {
    const r = pendingTasks.value.find(p => p.record_id === Number(route.query.record_id))
    if (r) selectTask(r)
  }
})

async function loadPendingList() {
  try {
    const records = await getPendingRecords(store.userId)
    const allTasks = await listTasks()
    pendingTasks.value = records.map((r) => {
      const t = allTasks.find((at) => String(at.task_id) === String(r.task_id))
      return {
        ...r,
        task_title: t ? t.title : `未知任務 (${r.task_id})`,
        task_category: t ? t.category : '一般'
      }
    })
  } catch (e) {
    console.error('Load Error:', e)
  } finally {
    loadingPending.value = false
  }
}

function selectTask(record: JoinedTaskRecord) {
  selectedRecord.value = record
  task.value = { title: record.task_title, category: record.task_category }
  step.value = 2
}

async function onSubmit() {
  if (!store.userId) return
  try {
    let finalRecordId = selectedRecord.value?.record_id
    if (!finalRecordId) throw new Error('No record ID')

    await completeWithCBT(store.userId, finalRecordId, {
      thought_before: thoughtBefore.value,
      anxiety_before: anxietyBefore.value,
      anxiety_after: anxietyAfter.value,
      feeling_after: thoughtAfter.value,
      distortions: selectedDistortions.value
    })
    
    notification.show('反思已完成', 'success')
    router.push('/dashboard')
  } catch (e: any) {
    notification.show('錯誤：' + e.message, 'error')
  }
}

const progress = computed(() => {
  if (step.value === 1) return 0
  return ((step.value - 2) / 3) * 100
})
</script>

<template>
  <div class="max-w-2xl mx-auto min-h-[60vh] md:min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-500 pb-24 md:pb-0">
    
    <!-- Step 1: Selection List -->
    <div v-if="step === 1" class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">專注時光</h1>
      <p class="text-gray-500">選擇一個任務來進行反思。</p>
      
      <div v-if="loadingPending" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"></div>
      </div>

      <div v-else-if="pendingTasks.length === 0" class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p class="text-gray-400 font-medium">目前沒有待處理的任務。</p>
        <button @click="router.push('/tasks')" class="mt-4 text-indigo-600 font-bold text-sm hover:underline">建立新任務</button>
      </div>

      <div v-else class="space-y-3">
        <button 
          v-for="item in pendingTasks" 
          :key="item.record_id"
          @click="selectTask(item)"
          class="w-full text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-600 hover:shadow-md transition-all group"
        >
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ item.task_title }}</span>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{{ item.task_category }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Wizard Steps -->
    <div v-else class="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 relative overflow-hidden">
      
      <!-- Progress Bar -->
      <div class="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
        <div class="h-full bg-indigo-600 transition-all duration-500" :style="{ width: `${progress}%` }"></div>
      </div>

      <!-- Step 2: Anxiety Before -->
      <div v-if="step === 2" class="space-y-8 py-4">
        <div class="text-center space-y-2">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">步驟 1 / 4</span>
          <h2 class="text-2xl font-bold text-gray-900">情緒檢測</h2>
          <p class="text-gray-500">在開始這項任務前，你的焦慮或不適程度有多少？</p>
        </div>
        
        <div class="flex flex-col items-center justify-center py-8">
           <div class="text-6xl font-black text-indigo-600 mb-8 font-mono">{{ anxietyBefore }}</div>
           <input type="range" min="0" max="10" v-model.number="anxietyBefore" class="w-full max-w-sm accent-indigo-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
           <div class="flex justify-between w-full max-w-sm mt-2 text-xs text-gray-400 font-bold uppercase">
             <span>平靜</span>
             <span>極度焦慮</span>
           </div>
        </div>
      </div>

      <!-- Step 3: Thought Capture -->
      <div v-if="step === 3" class="space-y-6 py-4">
        <div class="text-center space-y-2">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">步驟 2 / 4</span>
          <h2 class="text-2xl font-bold text-gray-900">捕捉想法</h2>
          <p class="text-gray-500">當下你有什麼具體的想法或擔憂？</p>
        </div>
        
        <textarea 
          v-model="thoughtBefore" 
          rows="5"
          class="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all resize-none text-lg text-gray-800 placeholder-gray-400"
          placeholder="我當時覺得..."
          autofocus
        ></textarea>
      </div>

      <!-- Step 4: Distortions -->
      <div v-if="step === 4" class="space-y-6 py-4">
         <div class="text-center space-y-2">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">步驟 3 / 4</span>
          <h2 class="text-2xl font-bold text-gray-900">識別思維陷阱</h2>
          <p class="text-gray-500">你是否察覺到以下任何認知偏誤？</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
           <div 
             v-for="d in distortions" 
             :key="d.id"
             @click="selectedDistortions.includes(d.id) ? selectedDistortions = selectedDistortions.filter(x => x !== d.id) : selectedDistortions.push(d.id)"
             class="p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
             :class="selectedDistortions.includes(d.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-300'"
           >
             <div class="flex items-center justify-between mb-1">
               <span class="font-bold text-sm text-gray-900">{{ d.label }}</span>
               <div v-if="selectedDistortions.includes(d.id)" class="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                 <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
               </div>
             </div>
             <p class="text-xs text-gray-500">{{ d.desc }}</p>
           </div>
        </div>
      </div>

      <!-- Step 5: Outcome -->
      <div v-if="step === 5" class="space-y-8 py-4">
         <div class="text-center space-y-2">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">最後一步</span>
          <h2 class="text-2xl font-bold text-gray-900">結果與轉念</h2>
          <p class="text-gray-500">完成任務後，你現在感覺如何？</p>
        </div>

         <div class="space-y-6">
           <div>
             <label class="block text-xs font-bold text-gray-400 uppercase mb-2">目前的焦慮程度</label>
             <div class="flex items-center gap-4">
               <input type="range" min="0" max="10" v-model.number="anxietyAfter" class="flex-1 accent-indigo-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
               <span class="text-2xl font-mono font-bold text-gray-900 w-8 text-center">{{ anxietyAfter }}</span>
             </div>
           </div>
           
           <div>
             <label class="block text-xs font-bold text-gray-400 uppercase mb-2">轉念後的想法</label>
             <textarea 
                v-model="thoughtAfter" 
                rows="3"
                class="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all resize-none"
                placeholder="回頭看，其實..."
              ></textarea>
           </div>
         </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between pt-8 mt-4 border-t border-gray-100">
         <button 
           v-if="step > 1" 
           @click="step--"
           class="text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2"
         >
           上一步
         </button>
         <div v-else></div> <!-- Spacer -->

         <button 
           v-if="step < 5" 
           @click="step++"
           class="bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
         >
           下一步
         </button>
         <button 
           v-else 
           @click="onSubmit"
           class="bg-indigo-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
         >
           完成反思
         </button>
      </div>

    </div>
  </div>
</template>
