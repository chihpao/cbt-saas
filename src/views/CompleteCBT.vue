<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 若你有現成 API 可用，請解註下行，並在 onSubmit 內呼叫
// import { saveCbtRecord /* etc. */ } from '@/services/supabaseApi'

const route = useRoute()
const router = useRouter()

const recordId = computed(() => route.query.record_id || null)

// 任務來源：
// 1) 有 record_id → 通常是 DB 任務（你可在此補 fetch 詳細資訊）
// 2) 沒 record_id → 走 localStorage.selected_task（臨時/或尚未綁定 DB）
const task = ref(null) // { title, category, ... }
const source = ref('') // 'db' | 'local' | 'unknown'

const loading = ref(true)
const err = ref('')

// CBT 表單欄位（依你的表設計調整）
const scoreBefore = ref(5)  // 0..10
const scoreAfter = ref(3)   // 0..10
const thoughtBefore = ref('')
const thoughtAfter = ref('')

onMounted(async () => {
  try {
    loading.value = true

    if (recordId.value) {
      // 👉 這裡可加上以 record_id 取回 DB 任務/排程資訊的流程
      // 例如：
      // const detail = await fetchRecordById(recordId.value)
      // task.value = { title: detail.task_title, category: detail.category, ... }
      // 這裡先用 localStorage 的 fallback，以確保可用
      const raw = localStorage.getItem('selected_task')
      if (raw) {
        task.value = JSON.parse(raw)
        source.value = 'db' // 假定為 DB 任務流程
      } else {
        source.value = 'unknown'
      }
    } else {
      // 沒有 record_id → 走 localStorage（支援未登入「臨時任務」）
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
  try {
    const payload = {
      record_id: recordId.value || null,
      task_title: task.value?.title || '（臨時任務）',
      task_category: task.value?.category || null,
      score_before: clamp01(scoreBefore.value, 0, 10),
      score_after: clamp01(scoreAfter.value, 0, 10),
      thought_before: thoughtBefore.value?.trim() || null,
      thought_after: thoughtAfter.value?.trim() || null,
      source: source.value,
    }

    // TODO: 呼叫你的後端 API 存檔
    // 例如：await saveCbtRecord(payload)
    console.log('CBT Submit =>', payload)

    alert('已提交完成紀錄！')
    // 完成後可清除臨時任務
    // localStorage.removeItem('selected_task')
    // localStorage.removeItem('scheduled_time')
    router.push('/dashboard') // 或導回首頁
  } catch (e) {
    console.error(e)
    alert('提交失敗：' + (e?.message || e))
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold">完成紀錄</h1>

    <div v-if="err" class="text-red-600 text-sm mt-2">{{ err }}</div>

    <div v-if="loading" class="mt-6">讀取中…</div>

    <div v-else class="mt-5 space-y-4">
      <div class="p-4 border rounded-lg">
        <div class="text-gray-500 text-xs mb-1">
          來源：{{ source || '—' }} <span v-if="recordId">（record_id: {{ recordId }}）</span>
        </div>
        <div class="text-lg font-semibold">
          {{ task?.title || '找不到任務資訊（可直接填寫）' }}
        </div>
        <div class="text-gray-500 text-sm">
          類別：{{ task?.category || '—' }}
        </div>
      </div>

      <!-- CBT 表單 -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">開始前焦慮（0-10）</label>
            <input
              type="number"
              min="0"
              max="10"
              v-model.number="scoreBefore"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">完成後焦慮（0-10）</label>
            <input
              type="number"
              min="0"
              max="10"
              v-model.number="scoreAfter"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">完成前的想法</label>
          <textarea
            rows="3"
            v-model="thoughtBefore"
            class="border rounded px-3 py-2 w-full"
            placeholder="例：我一定做不到／會很丟臉…"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">完成後的想法</label>
          <textarea
            rows="3"
            v-model="thoughtAfter"
            class="border rounded px-3 py-2 w-full"
            placeholder="例：其實比我想像中順利；下次可以…"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" class="px-4 py-2 rounded border" @click="$router.back()">返回</button>
          <button type="submit" class="px-4 py-2 rounded bg-black text-white">提交</button>
        </div>
      </form>
    </div>
  </div>
</template>
