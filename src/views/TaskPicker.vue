<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listTasks, getCurrentUser, getEphemeralTasks, createCustomTaskDB, addEphemeralTask } from '@/services/supabaseApi'
import AppLayout from '@/components/layout/AppLayout.vue'
import IconTaskList from '@/components/icons/IconTaskList.vue'

const router = useRouter()
const loading = ref(true)
const err = ref('')

const tasks = ref([])           
const selectedCategory = ref(null)
const customTitle = ref('')
const customCategory = ref('心情') 
const creating = ref(false)

const categories = [
  '正念','休閒','運動','健康','飲食','家務','學習','社交','工作'
]

const categoriesFromTasks = computed(() => {
  const set = new Set()
  tasks.value.forEach(t => set.add(t.category))
  const sorted = Array.from(set).sort((a, b) => {
    // Keep consistent order if possible, or just alpha
    return categories.indexOf(a) - categories.indexOf(b)
  })
  return sorted
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
  <AppLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">今天想做點什麼？</h1>
        <p class="mt-2 text-gray-500 text-lg">選擇一個任務，或建立屬於你的專屬活動。</p>
      </div>

      <!-- Custom Task Input Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50/50">
        <h2 class="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          建立新任務
        </h2>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1">
             <input 
              v-model="customTitle" 
              placeholder="例如：散步 10 分鐘、寫日記..." 
              class="w-full px-5 py-4 rounded-xl border-0 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400 font-medium"
              @keyup.enter="onAddCustom"
            />
          </div>
          <div class="w-full md:w-48 relative">
            <select 
              v-model="customCategory" 
              class="w-full appearance-none px-5 py-4 pr-10 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700 font-medium cursor-pointer"
            >
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button 
            class="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap active:scale-95" 
            :disabled="creating" 
            @click="onAddCustom"
          >
            {{ creating ? '新增中...' : '新增' }}
          </button>
        </div>
        <p v-if="err" class="text-red-500 text-sm mt-3 flex items-center gap-1 font-medium bg-red-50 p-2 rounded-lg inline-flex">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ err }}
        </p>
      </div>

      <!-- Task Selection Section -->
      <div v-if="loading" class="py-20 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-500"></div>
        <p class="mt-4 text-gray-400 text-sm font-medium tracking-wide">正在準備您的任務清單...</p>
      </div>
      
      <div v-else>
        <!-- Category Filter -->
        <div class="mb-8 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          <div class="flex gap-3">
            <button
              v-for="c in categoriesFromTasks"
              :key="c"
              class="px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border"
              :class="selectedCategory === c 
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 transform scale-105' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
              @click="selectedCategory = c"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <!-- Task Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            v-for="t in tasksByCategory"
            :key="t.task_id"
            class="group relative flex items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 text-left active:scale-[0.98]"
            @click="pickTask(t)"
          >
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mr-5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
               <IconTaskList class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{{ t.title }}</h3>
              <p class="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider group-hover:text-indigo-300">{{ t.category }}</p>
            </div>
            
            <!-- Badges -->
            <div class="absolute top-4 right-4 flex gap-1">
              <span v-if="t._ephemeral" class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">臨時</span>
              <span v-else-if="!t.is_default" class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">客製</span>
            </div>
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="tasksByCategory.length === 0" class="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
            <IconTaskList class="w-8 h-8" />
          </div>
          <p class="text-gray-500 font-medium">這個類別暫時沒有任務</p>
          <p class="text-gray-400 text-sm mt-1">試著新增一個吧！</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
