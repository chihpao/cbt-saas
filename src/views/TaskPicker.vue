<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listTasks, getCurrentUser, getEphemeralTasks, createCustomTaskDB, addEphemeralTask } from '@/services/supabaseApi'

const router = useRouter()
const loading = ref(true)
const err = ref('')

const tasks = ref([])           // 顯示任務（預設 + 客製 + 未登入暫存）
const selectedCategory = ref(null)
const customTitle = ref('')
const customCategory = ref('心情') // 9 大類預設：心情
const creating = ref(false)

// 9 大類別，固定選單
const categories = [
  '正念','休閒','運動','健康','飲食','家務','學習','社交','工作'
]

const categoriesFromTasks = computed(() => {
  const set = new Set()
  tasks.value.forEach(t => set.add(t.category))
  return Array.from(set)
})

const tasksByCategory = computed(() => {
  if (!selectedCategory.value) return []
  return tasks.value.filter(t => t.category === selectedCategory.value)
})

function ensureSelectedCategory() {
  const available = categoriesFromTasks.value
  if (!available.length) {
    selectedCategory.value = null
    return
  }
  if (!selectedCategory.value || !available.includes(selectedCategory.value)) {
    selectedCategory.value = available[0]
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [user, dbTasks] = await Promise.all([getCurrentUser(), listTasks()])
    const ephemerals = user ? [] : getEphemeralTasks()
    tasks.value = [...dbTasks, ...ephemerals]
    ensureSelectedCategory()
  } catch (e) {
    err.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
})

async function onAddCustom() {
  if (!customTitle.value.trim()) {
    err.value = '請輸入任務名稱'
    return
  }
  if (!customCategory.value) {
    err.value = '請選擇類別'
    return
  }
  creating.value = true
  try {
    const user = await getCurrentUser()
    if (user) {
      await createCustomTaskDB(customTitle.value.trim(), customCategory.value)
      const dbTasks = await listTasks()
      tasks.value = dbTasks
    } else {
      addEphemeralTask(customTitle.value.trim(), customCategory.value)
      const dbTasks = await listTasks()
      const ephemerals = getEphemeralTasks()
      tasks.value = [...dbTasks, ...ephemerals]
    }
    ensureSelectedCategory()
    customTitle.value = ''
    customCategory.value = '心情'
    err.value = ''
  } catch (e) {
    err.value = e?.message || String(e)
  } finally {
    creating.value = false
  }
}

function pickTask(t) {
  const payload = { task_id: t.task_id, title: t.title, category: t.category, is_default: !!t.is_default, _ephemeral: !!t._ephemeral }
  localStorage.setItem('selected_task', JSON.stringify(payload))
  const dt = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0,16)
  localStorage.setItem('scheduled_time', dt)
  router.push('/schedule')
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">選擇你的任務</h1>
    <p v-if="err" class="text-red-500 text-sm mt-2">{{ err }}</p>

    <div v-if="loading" class="mt-6 text-sm text-gray-500">載入中...</div>
    <div v-else>
      <div class="mt-4">
        <label class="text-sm text-gray-600">篩選類別</label>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="c in categoriesFromTasks"
            :key="c"
            class="px-3 py-1 rounded border"
            :class="{'bg-black text-white': selectedCategory === c}"
            @click="selectedCategory = c"
          >{{ c }}</button>
        </div>
      </div>

      <div class="mt-6 grid gap-2">
        <button
          v-for="t in tasksByCategory"
          :key="t.task_id"
          class="w-full text-left px-3 py-2 rounded border hover:bg-gray-50"
          @click="pickTask(t)"
        >
          <span>{{ t.title }}</span>
          <span v-if="t._ephemeral" class="ml-2 text-xs text-orange-600 border border-orange-300 rounded px-1">臨時</span>
          <span v-else-if="!t.is_default" class="ml-2 text-xs text-blue-600 border border-blue-300 rounded px-1">客製</span>
        </button>
      </div>

      <div class="mt-8">
        <h2 class="font-semibold mb-2">新增客製任務</h2>
        <div class="grid gap-2 md:grid-cols-[1fr_160px_auto]">
          <input v-model="customTitle" placeholder="例如：散步 10 分鐘" class="border rounded px-3 py-2" />
          <select v-model="customCategory" class="border rounded px-3 py-2">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <button class="px-4 rounded bg-black text-white disabled:opacity-60" :disabled="creating" @click="onAddCustom">
            新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
