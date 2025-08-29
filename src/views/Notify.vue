<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { scheduleTask, getOrCreateUser } from '../services/supabaseApi'
import { buildGoogleCalendarUrl } from '../utils/share'
import { buildICS, downloadICS } from '../utils/ics'

const router = useRouter()
const store = useAppStore()
const busy = ref(false)
const durationMin = 30   // 事件長度（可自行調整）

onMounted(async () => {
  // 回填（避免重整後 Pinia 狀態遺失）
  if (!store.selectedTask) {
    const cached = localStorage.getItem('selected_task')
    if (cached) store.selectedTask = JSON.parse(cached)
  }
  if (!store.scheduledTime) {
    const t = localStorage.getItem('scheduled_time')
    if (t) store.scheduledTime = t
  }
  // 確保 userId 存在（直接進路由或重整時）
  if (!store.userId) {
    let anon = localStorage.getItem('anon_id')
    if (!anon) { anon = uuid(); localStorage.setItem('anon_id', anon) }
    try { store.userId = await getOrCreateUser(anon) } catch {}
  }
  if (!store.selectedTask || !store.scheduledTime) {
    alert('找不到任務或時間，請重新選擇')
    router.replace('/tasks')
  }
})

function localYmdHmToDisplay(localYmdHm) {
  const d = new Date(localYmdHm)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function onConfirm() {
  if (!store.selectedTask) return alert('請先選擇任務')
  if (!store.scheduledTime) return alert('請先選擇時間')

  try {
    busy.value = true

    // 記錄排程（後端 RPC）
    const recordId = await scheduleTask(
      store.userId,
      store.selectedTask.task_id,
      new Date(store.scheduledTime).toISOString(),
      ['google_calendar'] // 只留 Google Calendar
    )
    store.lastRecordId = recordId
    localStorage.setItem('last_record_id', String(recordId))

    // 打開 Google Calendar 建立事件（新分頁）
    const desc = `CBT 任務提醒：${store.selectedTask.title}\n時間：${localYmdHmToDisplay(store.scheduledTime)}\n（此訊息由 CBT SaaS 建立）`
    const gcalUrl = buildGoogleCalendarUrl({
      title: store.selectedTask.title,
      startLocalYmdHm: store.scheduledTime,
      duration: durationMin,
      description: desc,
      location: ''
    })
    window.open(gcalUrl, '_blank', 'noopener')

    router.push('/complete')
  } catch (e) {
    console.error(e)
    alert('建立排程或開啟行事曆時發生錯誤：' + (e?.message || e))
  } finally {
    busy.value = false
  }
}

function onDownloadICS() {
  if (!store.selectedTask || !store.scheduledTime) return
  const start = new Date(store.scheduledTime)
  const end = new Date(start.getTime() + durationMin * 60000)
  const ics = buildICS({
    uid: `cbt-${Date.now()}-${(store.lastRecordId ?? uuid())}`,
    title: store.selectedTask.title,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    desc: `CBT 任務提醒：${store.selectedTask.title}`,
  })
  downloadICS(`cbt-${start.toISOString().slice(0,16).replace(/[:T]/g,'')}.ics`, ics)
}
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">加入行事曆</h2>
    <p class="text-gray-600 text-sm">
      會直接開啟 Google 行事曆的「建立事件」頁面，請在該頁確認後儲存。
    </p>

    <div class="border rounded p-3 bg-white">
      <div class="text-sm text-gray-500">任務</div>
      <div class="font-medium">{{ store.selectedTask?.title }}</div>
      <div class="text-sm text-gray-500 mt-2">時間</div>
      <div>{{ new Date(store.scheduledTime).toLocaleString() }}</div>
    </div>

    <button
      class="w-full py-3 rounded bg-black text-white disabled:opacity-60"
      :disabled="busy"
      @click="onConfirm"
    >
      {{ busy ? '處理中…' : '確認並開啟 Google 行事曆' }}
    </button>

    <button
      class="w-full py-3 rounded border bg-white"
      :disabled="busy"
      @click="onDownloadICS"
    >
      下載 ICS 檔（其他行事曆）
    </button>
  </div>
</template>
