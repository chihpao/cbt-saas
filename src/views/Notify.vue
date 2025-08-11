<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { scheduleTask } from '../services/mockApi'
import { buildICS, downloadICS } from '../utils/ics'

const router = useRouter()
const store = useAppStore()
const opt = ref({ gcal: true, email: false, line: false })
const busy = ref(false)

onMounted(() => {
  if (!store.selectedTask) {
    const cached = localStorage.getItem('selected_task')
    if (cached) store.selectedTask = JSON.parse(cached)
  }
  if (!store.scheduledTime) {
    const t = localStorage.getItem('scheduled_time')
    if (t) store.scheduledTime = t
  }
  if (!store.selectedTask || !store.scheduledTime) {
    alert('找不到任務或時間，請重新選擇')
    router.replace('/tasks')
  }
})

function toISO(dt) {
  return typeof dt === 'string' ? new Date(dt).toISOString() : dt.toISOString()
}

async function onConfirm() {
  if (!store.selectedTask) return alert('請先選擇任務')
  if (!store.scheduledTime) return alert('請先選擇時間')

  try {
    busy.value = true
    const types = []
    if (opt.value.gcal) types.push('google_calendar')
    if (opt.value.email) types.push('email')
    if (opt.value.line) types.push('line')

    const recordId = await scheduleTask(
      store.userId || 'demo-user',
      store.selectedTask.task_id,
      toISO(store.scheduledTime),
      types
    )
    store.lastRecordId = recordId

    if (opt.value.gcal) {
      const startISO = toISO(store.scheduledTime)
      const endISO = new Date(new Date(store.scheduledTime).getTime() + 30 * 60000).toISOString()
      const ics = buildICS({
        uid: `rec-${recordId}@cbt-saas`,
        title: store.selectedTask.title,
        startISO,
        endISO,
        desc: 'CBT 任務提醒'
      })
      downloadICS('cbt-task.ics', ics)
    }

    router.push('/complete')
  } catch (e) {
    console.error(e)
    alert('建立排程或下載檔案時發生錯誤：' + (e?.message || e))
  } finally {
    busy.value = false
  }
}
</script>


<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">選擇傳送方式</h2>

    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="opt.gcal" />
      <span>加入行事曆（下載 .ics）</span>
    </label>

    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="opt.email" />
      <span>Email 提醒（下版串接）</span>
    </label>

    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="opt.line" />
      <span>LINE 分享（下版串接）</span>
    </label>

    <button
      class="w-full py-3 rounded bg-black text-white disabled:opacity-60"
      :disabled="busy"
      @click="onConfirm"
    >
      {{ busy ? '處理中…' : '確認' }}
    </button>
  </div>
</template>
