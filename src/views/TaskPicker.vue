<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  listTasks,
  getCurrentUser,
  getEphemeralTasks,
  createCustomTaskDB,
  addEphemeralTask,
  deleteCustomTask,
  ensureCurrentUser
} from '@/services/supabaseApi'
import { useNotificationStore } from '@/stores/notification'
import { useAppStore } from '@/stores/app'
import { v4 as uuid } from 'uuid'
import IconTaskList from '@/components/icons/IconTaskList.vue'
import ScheduleModal from '@/components/common/ScheduleModal.vue'
import type { Task } from '@/types'

const router = useRouter()
const notification = useNotificationStore()
const store = useAppStore()
const loading = ref(true)

const tasks = ref<Task[]>([])
const selectedCategory = ref<string | null>(null)
const customTitle = ref('')
const customCategory = ref('心理')
const creating = ref(false)

// Modal State
const showScheduleModal = ref(false)
const targetTask = ref<Task | null>(null)

async function onDeleteTask(t: Task, event: Event) {
  event.stopPropagation()
  if (!confirm(`確定要刪除「${t.title}」嗎？`)) return
  
  try {
    if ((t as any)._ephemeral) {
      const list = getEphemeralTasks().filter((x: any) => x.task_id !== t.task_id)
      localStorage.setItem('cbt_ephemeral_tasks', JSON.stringify(list))
    } else {
      await deleteCustomTask(t.task_id)
    }
    await refreshTasks()
    notification.show('任務已刪除', 'success')
  } catch (e: any) {
    notification.show('刪除失敗', 'error')
  }
}

const categories = ['心理', '休息', '運動', '健康', '飲食', '家事', '學習', '社交', '工作']

const categoriesFromTasks = computed(() => {
  const set = new Set<string>()
  tasks.value.forEach((t) => set.add(t.category))
  return Array.from(set).sort((a, b) => categories.indexOf(a) - categories.indexOf(b))
})

const tasksByCategory = computed(() => {
  if (!selectedCategory.value) return []
  return tasks.value.filter((t) => t.category === selectedCategory.value)
})

async function refreshTasks() {
  const [user, dbTasks] = await Promise.all([getCurrentUser(), listTasks()])
  const ephemerals = user ? [] : getEphemeralTasks()
  tasks.value = [...dbTasks, ...ephemerals]
  
  // Ensure category selection remains valid
  if (!selectedCategory.value || !categoriesFromTasks.value.includes(selectedCategory.value)) {
    selectedCategory.value = categoriesFromTasks.value[0] || null
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (!store.userId) {
      let anon = localStorage.getItem('anon_id')
      if (!anon) {
        anon = uuid()
        localStorage.setItem('anon_id', anon)
      }
      const user = await getCurrentUser()
      store.userId = user ? user.id : anon
    }
    await refreshTasks()
  } catch (e: any) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function onAddCustom() {
  if (!customTitle.value.trim()) return
  creating.value = true
  try {
    const user = await getCurrentUser()
    if (user) {
      await createCustomTaskDB(customTitle.value.trim(), customCategory.value)
    } else {
      addEphemeralTask(customTitle.value.trim(), customCategory.value)
    }
    await refreshTasks()
    customTitle.value = ''
    notification.show('任務已新增', 'success')
  } catch (e: any) {
    notification.show('新增任務失敗', 'error')
  } finally {
    creating.value = false
  }
}

async function pickTask(t: Task) {
  await ensureCurrentUser()
  targetTask.value = t
  showScheduleModal.value = true
}
</script>

<template>
  <div class="max-w-5xl mx-auto animate-in fade-in duration-500">
    <ScheduleModal 
      :is-open="showScheduleModal" 
      :task="targetTask"
      @close="showScheduleModal = false"
    />

    <!-- Header -->
    <header class="mb-8 border-b border-gray-100 pb-6">
      <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">任務圖書館</h1>
      <p class="text-gray-500 mt-1 text-sm font-medium">選擇一項活動來安排行程或進行反思。</p>
    </header>

    <!-- Create New (Top Bar) -->
    <div class="mb-8 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-2">
       <input 
         v-model="customTitle"
         placeholder="建立自訂任務..."
         class="flex-1 px-4 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium"
         @keyup.enter="onAddCustom"
       />
       <div class="flex gap-2">
         <select v-model="customCategory" class="bg-gray-50 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 outline-none border border-transparent hover:border-gray-200 cursor-pointer">
           <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
         </select>
         <button 
           @click="onAddCustom"
           :disabled="!customTitle.trim()" 
           class="bg-gray-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         >
           新增
         </button>
       </div>
    </div>

    <!-- Categories -->
    <div class="mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <div class="flex gap-2">
        <button
            v-for="c in categoriesFromTasks"
            :key="c"
            @click="selectedCategory = c"
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap active:scale-95 border"
            :class="selectedCategory === c ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
        >
            {{ c }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
       <div v-for="i in 8" :key="i" class="aspect-square bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
    </div>

    <div v-else-if="tasksByCategory.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="t in tasksByCategory"
        :key="t.task_id"
        class="group flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all duration-200 text-left h-40 relative overflow-hidden"
        @click="pickTask(t)"
      >
        <div class="flex justify-between items-start">
           <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
             <IconTaskList class="w-5 h-5" />
           </div>
           
           <button 
             v-if="!t.is_default"
             @click.stop="onDeleteTask(t, $event)"
             class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
           >
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        
        <div>
           <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{{ t.category }}</span>
           <h3 class="font-bold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">{{ t.title }}</h3>
        </div>
      </button>
    </div>

    <div v-else class="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
      <p class="text-gray-400 font-medium">此分類下尚無任務。</p>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
