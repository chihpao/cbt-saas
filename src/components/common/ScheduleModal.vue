<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task } from '@/types'
import { scheduleTask } from '@/services/supabaseApi'
import { useNotificationStore } from '@/stores/notification'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  task: Task | null
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'saved'])

const notification = useNotificationStore()
const store = useAppStore()

const scheduledTime = ref('')
const saving = ref(false)
const step = ref<'input' | 'success'>('input')
const successData = ref({ title: '', time: '' })

watch(() => props.isOpen, (val) => {
  if (val) {
    step.value = 'input'
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    const tzOffset = now.getTimezoneOffset() * 60000
    scheduledTime.value = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16)
  }
})

async function onConfirm() {
  if (!props.task || !scheduledTime.value) return
  saving.value = true
  try {
    const isoTime = new Date(scheduledTime.value).toISOString()
    await scheduleTask(store.userId, props.task.task_id, isoTime, [])
    successData.value = { title: props.task.title, time: isoTime }
    step.value = 'success'
    emit('saved')
  } catch {
    notification.show('失敗', 'error')
  } finally {
    saving.value = false
  }
}

function openGoogleCalendar() {
  const start = successData.value.time.replace(/-|:|\.\d+/g, '')
  const end = new Date(new Date(successData.value.time).getTime() + 30*60000).toISOString().replace(/-|:|\.\d+/g, '')
  const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(successData.value.title)}&dates=${start}/${end}&details=CBT`
  window.open(gUrl, '_blank')
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
      
      <!-- Step 1: Input -->
      <div v-if="step === 'input'" class="p-8">
        <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 class="text-xl font-black text-gray-900 tracking-tight">{{ task?.title }}</h3>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">預定執行時間</label>
            <input 
              type="datetime-local" 
              v-model="scheduledTime"
              class="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-gray-700"
            >
          </div>
        </div>

        <div class="flex gap-3 mt-10">
          <button @click="$emit('close')" class="px-6 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all active:scale-95">取消</button>
          <button @click="onConfirm" :disabled="saving" class="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">確認</button>
        </div>
      </div>

      <!-- Step 2: Success -->
      <div v-else class="p-10 text-center">
        <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">已排程</h3>
        <p class="text-gray-400 font-bold text-sm mb-10">任務已同步至您的清單</p>
        
        <div class="space-y-3">
            <button @click="openGoogleCalendar" class="w-full py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                加入行事曆
            </button>
            <button @click="$emit('close')" class="w-full py-4 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all text-sm active:scale-95">
                關閉
            </button>
        </div>
      </div>

    </div>
  </div>
</template>
