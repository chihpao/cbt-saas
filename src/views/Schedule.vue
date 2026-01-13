<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()

const task = ref(null)               
const scheduled = ref('')            

const err = ref('')
const ready = ref(false)

onMounted(() => {
  try {
    const raw = localStorage.getItem('selected_task')
    if (!raw) {
      err.value = '尚未選擇任務，請先回「本週想做的事情」。'
      return
    }
    task.value = JSON.parse(raw)

    const storedTime = localStorage.getItem('scheduled_time')
    if (storedTime) {
      scheduled.value = storedTime
    } else {
      const dt = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)
      scheduled.value = dt
      localStorage.setItem('scheduled_time', dt)
    }
  } catch (e) {
    err.value = '讀取任務或時間時發生錯誤'
  } finally {
    ready.value = true
  }
})

const taskBadge = computed(() => {
  if (!task.value) return ''
  if (task.value._ephemeral) return '臨時' // Changed "只當次" to "臨時" for consistency
  if (!task.value.is_default) return '自訂'
  return '預設'
})

function onTimeChange(e) {
  scheduled.value = e.target.value
  localStorage.setItem('scheduled_time', scheduled.value)
}

function goBack() {
  router.push('/tasks')
}

function goNext() {
  if (!task.value) {
    err.value = '尚未選擇任務'
    return
  }
  if (!scheduled.value) {
    err.value = '請選擇時間'
    return
  }
  router.push('/notify')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">確認時間</h1>
        <p class="mt-2 text-gray-500 text-lg">為這項活動安排一個合適的時間。</p>
      </div>

      <p v-if="err" class="text-sm text-red-600 mb-6 bg-red-50 p-4 rounded-xl flex items-center gap-2 font-medium">
        <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        {{ err }}
      </p>

      <div v-if="ready && task" class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50/50 space-y-8">
        <!-- Task Info -->
        <div class="flex items-start justify-between border-b border-gray-100 pb-8">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ task.title }}</h2>
            <p class="text-gray-500 text-sm mt-1">
              類別：<span class="text-indigo-600 font-medium">{{ task.category || '—' }}</span>
            </p>
          </div>
          <span 
            class="px-3 py-1 rounded-full text-xs font-medium border"
            :class="{
              'bg-orange-50 text-orange-600 border-orange-200': task._ephemeral,
              'bg-blue-50 text-blue-600 border-blue-200': !task._ephemeral && !task.is_default,
              'bg-gray-50 text-gray-600 border-gray-200': task.is_default
            }"
          >
            {{ taskBadge }}
          </span>
        </div>

        <!-- Date Picker -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">開始時間</label>
          <div class="relative">
            <input
              type="datetime-local"
              :value="scheduled"
              @change="onTimeChange"
              class="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
            />
          </div>
          <p class="text-xs text-gray-400 mt-2">我們會在這個時間提醒你。</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            @click="goBack"
            class="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
          >
            上一步
          </button>
          <button 
            @click="goNext"
            class="w-full sm:flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
