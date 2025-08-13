<script setup>
import { onMounted, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { stats, getOrCreateUser } from '../services/supabaseApi'

const store = useAppStore()
const s = ref({ planned: 0, completed: 0, avg_relief: 0 })
const loading = ref(true)
const err = ref('')

onMounted(async () => {
  try {
    // 1) 若沒有 userId（例如直接打 /dashboard），用 anon_id 取得/建立
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) { anon = uuid(); localStorage.setItem('anon_id', anon) }
      store.userId = await getOrCreateUser(anon)
    }
    // 2) 叫 stats（已在 API 端處理陣列→單物件）
    s.value = await stats(store.userId)
  } catch (e) {
    err.value = e?.message || String(e)
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">我的儀表板</h2>

    <div v-if="loading">載入中…</div>
    <div v-else>
      <p v-if="err" class="text-red-500 text-sm">{{ err }}</p>

      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="border rounded p-3">
          <div class="text-2xl font-bold">{{ s.planned }}</div>
          <div class="text-xs text-gray-500">計畫</div>
        </div>
        <div class="border rounded p-3">
          <div class="text-2xl font-bold">{{ s.completed }}</div>
          <div class="text-xs text-gray-500">完成</div>
        </div>
        <div class="border rounded p-3">
          <div class="text-2xl font-bold">{{ s.avg_relief }}</div>
          <div class="text-xs text-gray-500">平均焦慮↓</div>
        </div>
      </div>

      <button class="w-full py-3 rounded bg-black text-white" @click="$router.push('/tasks')">
        再安排一個
      </button>
    </div>
  </div>
</template>
