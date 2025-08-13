<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { useAppStore } from '../stores/app'
import { getOrCreateUser, listTasks, createCustomTask } from '../services/supabaseApi'

const router = useRouter()
const store = useAppStore()

const custom = ref('')
const loading = ref(true)
const err = ref('')

onMounted(async () => {
  try {
    // 匿名識別：localStorage 存 anon_id → 到後端換 user_id
    let anon = localStorage.getItem('anon_id')
    if (!anon) { anon = uuid(); localStorage.setItem('anon_id', anon) }

    store.userId = await getOrCreateUser(anon)
    store.tasks = await listTasks(store.userId)
  } catch (e) {
    err.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
})

async function addCustom() {
  if (!custom.value.trim()) return
  await createCustomTask(store.userId, custom.value.trim())
  store.tasks = await listTasks(store.userId)
  custom.value = ''
}

function pick(t) {
  store.selectedTask = { task_id: t.task_id, title: t.title }
  localStorage.setItem('selected_task', JSON.stringify(store.selectedTask))

  const dt = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)
  store.scheduledTime = dt
  localStorage.setItem('scheduled_time', dt)

  router.push('/schedule')
}
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">本週想做的事情</h2>

    <div v-if="loading">載入中...</div>
    <div v-else>
      <p v-if="err" class="text-red-500 text-sm mb-2">{{ err }}</p>

      <div class="grid gap-3">
        <button
          v-for="t in store.tasks"
          :key="t.task_id"
          class="text-left p-3 rounded bg-white border active:scale-[0.99]"
          @click="pick(t)"
        >
          <div class="font-medium">{{ t.title }}</div>
          <div v-if="t.description" class="text-xs text-gray-500">{{ t.description }}</div>
          <div class="text-[10px] text-gray-400 mt-1">{{ t.is_default ? '預設' : '自訂' }}</div>
        </button>
      </div>

      <div class="mt-6">
        <label class="text-sm text-gray-600">自訂任務</label>
        <div class="flex gap-2 mt-2">
          <input v-model="custom" placeholder="例如：散步到超商" class="flex-1 border rounded px-3 py-2"/>
          <button class="px-3 rounded bg-black text-white" @click="addCustom">新增</button>
        </div>
      </div>
    </div>
  </div>
</template>
