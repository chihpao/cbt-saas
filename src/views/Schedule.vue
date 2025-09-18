<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const task = ref(null)               // { task_id, title, category, is_default?, _ephemeral? }
const scheduled = ref('')            // yyyy-MM-ddTHH:mm（本地）

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

    // 預設時間：若沒有，就給 30 分鐘後
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
  if (task.value._ephemeral) return '只當次'
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
  // 時間已寫回 localStorage，直接前往通知畫面
  router.push('/notify')
}
</script>

<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold">確認時間</h1>
    <p v-if="err" class="text-sm text-red-600 mt-2">{{ err }}</p>

    <div v-if="ready && task" class="mt-5 space-y-4">
      <div class="p-4 border rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-semibold">{{ task.title }}</div>
            <div class="text-gray-500 text-sm">
              類別：{{ task.category || '—' }}
            </div>
          </div>
          <div
            class="text-xs px-2 py-1 rounded border"
            :class="{
              'text-orange-600 border-orange-300': task._ephemeral,
              'text-blue-600 border-blue-300': !task._ephemeral && !task.is_default,
              'text-gray-600 border-gray-300': task.is_default
            }"
          >
            {{ taskBadge }}
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm text-gray-600 mb-1">開始時間</label>
          <input
            type="datetime-local"
            :value="scheduled"
            @change="onTimeChange"
            class="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      <div class="flex gap-3">
        <button class="px-4 py-2 rounded border" @click="goBack">上一步</button>
        <button class="px-4 py-2 rounded bg-black text-white" @click="goNext">下一步</button>
      </div>
    </div>
  </div>
</template>
