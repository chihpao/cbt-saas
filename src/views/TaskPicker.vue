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
  getOrCreateUser
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
const err = ref('')

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
    const [user, dbTasks] = await Promise.all([getCurrentUser(), listTasks()])
    const ephemerals = user ? [] : getEphemeralTasks()
    tasks.value = [...dbTasks, ...ephemerals]
    ensureSelectedCategory()
    notification.show('已移除', 'success')
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

function ensureSelectedCategory() {
  const available = categoriesFromTasks.value
  if (!available.length) {
    selectedCategory.value = null
    return
  }
  if (!selectedCategory.value || !available.includes(selectedCategory.value)) {
    selectedCategory.value = available[0] || null
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
    
    const [user, dbTasks] = await Promise.all([
      getCurrentUser(), 
      listTasks().catch(() => [])
    ])

    const ephemerals = user ? [] : getEphemeralTasks()
    tasks.value = [...dbTasks, ...ephemerals]
    ensureSelectedCategory()
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
      tasks.value = await listTasks()
    } else {
      addEphemeralTask(customTitle.value.trim(), customCategory.value)
      const dbTasks = await listTasks()
      const ephemerals = getEphemeralTasks()
      tasks.value = [...dbTasks, ...ephemerals]
    }
    ensureSelectedCategory()
    customTitle.value = ''
    notification.show('已建立新任務', 'success')
  } catch (e: any) {
    notification.show('建立失敗', 'error')
  } finally {
    creating.value = false
  }
}

async function pickTask(t: Task) {
  if (!store.userId) {
    let anon = localStorage.getItem('anon_id')
    if (!anon) {
      anon = uuid()
      localStorage.setItem('anon_id', anon)
    }
    store.userId = await getOrCreateUser(anon)
  }
  targetTask.value = t
  showScheduleModal.value = true
}
</script>

<template>
  <div>
    <ScheduleModal 
      :is-open="showScheduleModal" 
      :task="targetTask"
      @close="showScheduleModal = false"
    />

    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Quick Actions Bar (Add & Filter) -->
      <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <!-- Categories (Scrollable) -->
        <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 px-2 scrollbar-hide flex-1">
          <button
            v-for="c in categoriesFromTasks"
            :key="c"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95"
            :class="
              selectedCategory === c
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            "
            @click="selectedCategory = c"
          >
            {{ c }}
          </button>
        </div>

        <!-- Add New (Compact) -->
        <div class="flex gap-2 items-center pl-2 border-l border-gray-100">
           <div class="relative group">
            <input
              v-model="customTitle"
              placeholder="建立新任務..."
              class="w-full md:w-48 px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
              @keyup.enter="onAddCustom"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span class="text-[10px] text-gray-400 bg-white border px-1 rounded">Enter</span>
            </div>
           </div>
           <select v-model="customCategory" class="w-20 px-2 py-2 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 outline-none cursor-pointer hover:bg-gray-100 transition-colors appearance-none text-center">
             <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
           </select>
           <button 
             @click="onAddCustom" 
             :disabled="!customTitle.trim()"
             class="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-md shadow-indigo-200"
           >
             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
           </button>
        </div>
      </div>

      <!-- Task Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div v-for="i in 6" :key="i" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>

      <div v-else-if="tasksByCategory.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="t in tasksByCategory"
          :key="t.task_id"
          class="group relative flex items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 text-left active:scale-[0.98]"
          @click="pickTask(t)"
        >
          <div
            class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110"
          >
            <IconTaskList class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 text-base group-hover:text-indigo-600 transition-colors">
              {{ t.title }}
            </h3>
          </div>

          <!-- Hover Action -->
          <div class="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          
          <!-- Delete (Only visible on hover if custom) -->
          <button 
            v-if="!t.is_default"
            @click.stop="onDeleteTask(t, $event)"
            class="absolute top-2 right-2 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-20 text-gray-300"
      >
        <IconTaskList class="w-12 h-12 mb-2 opacity-20" />
        <p class="text-sm font-medium">尚無任務</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
