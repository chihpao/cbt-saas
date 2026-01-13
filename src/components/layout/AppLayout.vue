<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'

const router = useRouter()
const user = ref(null)
const isUserMenuOpen = ref(false)

const handleSwitchAccount = async () => {
  try {
    await signOut()
    user.value = null
    router.push('/login')
  } catch (error) {
    console.error('切換帳號錯誤:', error.message)
  }
}

const handleSignOut = async () => { 
  try {
    await signOut()
    user.value = null 
    router.push('/')
  } catch (error) {
    console.error('登出錯誤:', error.message)
  }
}

onMounted(async () => {
  user.value = await getCurrentUser()
  
  // 監聽認證狀態變化
  const { data: { subscription } } = supa.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
  
  return () => {
    subscription?.unsubscribe?.()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-700">
    <!-- Header (Sticky & Glass) -->
    <header class="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2 cursor-pointer flex-shrink-0 group" @click="router.push('/dashboard')">
          <img src="/logo.svg" alt="CBT 小幫手" class="h-8 w-8 transition-transform group-hover:scale-110 duration-300"/>
          <span class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight hidden sm:inline">CBT 小幫手</span>
        </div>

        <!-- Navigation Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-2 mx-2 bg-gray-100/50 p-1 rounded-xl">
          <router-link 
            to="/tasks" 
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            active-class="bg-white text-indigo-600 shadow-sm"
            :class="$route.path.startsWith('/tasks') || $route.path === '/schedule' || $route.path === '/notify' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'"
          >
            任務
          </router-link>
          <router-link 
            to="/complete" 
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            active-class="bg-white text-indigo-600 shadow-sm"
            :class="$route.path === '/complete' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'"
          >
            進行中
          </router-link>
          <router-link 
            to="/dashboard" 
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            active-class="bg-white text-indigo-600 shadow-sm"
            :class="$route.path === '/dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'"
          >
            儀表板
          </router-link>
        </nav>

          <!-- User Profile Dropdown -->
          <div v-if="user" class="relative ml-4">
            <button 
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center gap-2 rounded-full border border-gray-200 bg-white pl-1 pr-1 py-1 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              title="使用者選單"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {{ user.email ? user.email.substring(0, 2).toUpperCase() : 'USER' }}
              </div>
              <!-- Mobile only: show simple chevron -->
              <svg class="w-4 h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-show="isUserMenuOpen" 
              class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all duration-200"
            >
              <div class="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Signed in as</p>
                <p class="text-sm font-semibold text-gray-900 truncate" :title="user.email">{{ user.email }}</p>
              </div>

              <div class="p-1">
                <button 
                  @click="handleSwitchAccount"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                >
                   <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                   切換帳號
                </button>
                <button 
                  @click="handleSignOut"
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  登出
                </button>
              </div>
            </div>

            <!-- Backdrop to close -->
            <div v-if="isUserMenuOpen" @click="isUserMenuOpen = false" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
          </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-6 mb-20 md:mb-0">
      <slot />
    </main>

    <!-- Footer (Hidden on mobile) -->
    <footer class="py-8 bg-white border-t border-gray-100 mt-auto hidden md:block">
      <div class="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} CBT 小幫手. All rights reserved.</p>
      </div>
    </footer>

    <!-- Mobile Bottom Navigation (Glass) -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 flex justify-around items-center px-4 py-2 z-50 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      <router-link 
        to="/tasks" 
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 flex-1 relative overflow-hidden active:scale-95"
        active-class="text-indigo-600"
        :class="$route.path.startsWith('/tasks') || $route.path === '/schedule' || $route.path === '/notify' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
      >
        <div class="relative z-10 flex flex-col items-center">
           <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           <span class="text-[10px] font-bold tracking-wide">任務</span>
        </div>
        <div v-if="$route.path.startsWith('/tasks') || $route.path === '/schedule' || $route.path === '/notify'" class="absolute inset-x-8 top-1/2 -translate-y-1/2 h-8 bg-indigo-50 rounded-full -z-0 blur-sm"></div>
      </router-link>

      <router-link 
        to="/complete" 
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 flex-1 relative overflow-hidden active:scale-95"
        active-class="text-indigo-600"
        :class="$route.path === '/complete' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
      >
        <div class="relative z-10 flex flex-col items-center">
           <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
           <span class="text-[10px] font-bold tracking-wide">進行中</span>
        </div>
        <div v-if="$route.path === '/complete'" class="absolute inset-x-8 top-1/2 -translate-y-1/2 h-8 bg-indigo-50 rounded-full -z-0 blur-sm"></div>
      </router-link>
      
      <router-link 
        to="/dashboard" 
        class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 flex-1 relative overflow-hidden active:scale-95"
        active-class="text-indigo-600"
        :class="$route.path === '/dashboard' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
      >
        <div class="relative z-10 flex flex-col items-center">
           <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
           <span class="text-[10px] font-bold tracking-wide">儀表板</span>
        </div>
        <div v-if="$route.path === '/dashboard'" class="absolute inset-x-8 top-1/2 -translate-y-1/2 h-8 bg-indigo-50 rounded-full -z-0 blur-sm"></div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* No changes needed for CSS, using Tailwind utilities */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
