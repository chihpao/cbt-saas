<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { scheduleTask, getOrCreateUser } from '../services/supabaseApi'
import { buildGoogleCalendarUrl } from '../utils/share'
import { buildICS, downloadICS } from '../utils/ics'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const store = useAppStore()
const busy = ref(false)
const durationMin = 30   

onMounted(async () => {
  if (!store.selectedTask) {
    const cached = localStorage.getItem('selected_task')
    if (cached) store.selectedTask = JSON.parse(cached)
  }
  if (!store.scheduledTime) {
    const t = localStorage.getItem('scheduled_time')
    if (t) store.scheduledTime = t
  }
  if (!store.userId) {
    let anon = localStorage.getItem('anon_id')
    if (!anon) { anon = uuid(); localStorage.setItem('anon_id', anon) }
    try { store.userId = await getOrCreateUser(anon) } catch {}
  }
  if (!store.selectedTask || !store.scheduledTime) {
    // Ideally use a toast instead of alert, but keeping logic same for now
    router.replace('/tasks')
  }
})

function localYmdHmToDisplay(localYmdHm) {
  const d = new Date(localYmdHm)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function makeCompleteLink(recordId) {
  const base = `${window.location.origin}/complete`
  return recordId ? `${base}?record_id=${encodeURIComponent(recordId)}` : base
}

async function onConfirm() {
  if (!store.selectedTask) return alert('請先選擇任務')
  if (!store.scheduledTime) return alert('請先選擇時間')

  try {
    busy.value = true

    let recordId = null
    try {
      recordId = await scheduleTask(
        store.userId,
        store.selectedTask.task_id,                         
        new Date(store.scheduledTime).toISOString(),
        ['google_calendar']                                  
      )
      if (recordId) {
        store.lastRecordId = recordId
        localStorage.setItem('last_record_id', String(recordId))
      }
    } catch (e) {
      console.warn('scheduleTask 失敗，改用無 recordId 流程：', e?.message || e)
    }

    const completeLink = makeCompleteLink(recordId)
    const desc =
      `CBT 任務提醒：${store.selectedTask.title}\n` +
      `時間：${localYmdHmToDisplay(store.scheduledTime)}\n\n` +
      `完成後請回到這裡填寫完成紀錄：\n${completeLink}\n\n` +
      `（此訊息由 CBT SaaS 建立）`

    const gcalUrl = buildGoogleCalendarUrl({
      title: store.selectedTask.title,
      startLocalYmdHm: store.scheduledTime,
      duration: durationMin,
      description: desc,
      location: ''
    })
    window.open(gcalUrl, '_blank', 'noopener')

    alert('已開啟 Google 行事曆。請在行事曆儲存事件，完成任務後從事件描述中的連結回來填寫完成紀錄。')
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
    desc: `CBT 任務提醒：${store.selectedTask.title}\n完成後請回到：${makeCompleteLink(store.lastRecordId)} 填寫完成紀錄`,
  })
  downloadICS(`cbt-${start.toISOString().slice(0,16).replace(/[:T]/g,'')}.ics`, ics)
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl font-bold text-gray-900">加入行事曆</h1>
        <div class="h-1 w-16 bg-indigo-500 rounded mt-2 mx-auto md:mx-0"></div>
        <p class="mt-2 text-gray-500">將這項活動加入你的行事曆，提醒自己去完成。</p>
      </div>

      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
          <svg class="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p class="text-sm text-indigo-900">
            我們會幫你開啟 Google 行事曆的「建立事件」頁面。請在該頁確認後儲存。完成任務後，請從事件說明中的連結回來填寫完成紀錄。
          </p>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-gray-500 text-sm">任務</span>
            <span class="font-semibold text-gray-900">{{ store.selectedTask?.title || '—' }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-gray-500 text-sm">時間</span>
            <span class="font-medium text-gray-900">{{ store.scheduledTime ? new Date(store.scheduledTime).toLocaleString() : '—' }}</span>
          </div>
        </div>

        <div class="space-y-3 pt-4">
          <button
            class="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="busy"
            @click="onConfirm"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ busy ? '處理中…' : '確認並開啟 Google 行事曆' }}
          </button>

          <button
            class="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
            :disabled="busy"
            @click="onDownloadICS"
          >
            下載 ICS 檔（其他行事曆）
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
