<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import type { User } from '@supabase/supabase-js'

const router = useRouter()
const user = ref<User | null>(null)
const isUserMenuOpen = ref(false)

// 1. Persist Collapsed State
const isCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')

watch(isCollapsed, (val) => {
  localStorage.setItem('sidebar_collapsed', String(val))
})

const handleSignOut = async () => { 
  try {
    await signOut()
    user.value = null 
    router.push('/')
  } catch (error: any) {
    console.error('登出錯誤:', error.message)
  }
}

onMounted(async () => {
  user.value = await getCurrentUser()
  const { data: { subscription } } = supa.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })
  return () => subscription.unsubscribe()
})

const navItems = computed(() => [
  {
    name: '任務',
    path: '/tasks',
    match: (p: string) => p.startsWith('/tasks'),
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    name: '反思',
    path: '/complete',
    match: (p: string) => p === '/complete',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  },
  {
    name: '儀表板',
    path: '/dashboard',
    match: (p: string) => p === '/dashboard',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z'
  }
])
</script>

<template>
  <div class="flex h-screen w-full bg-[#FAFAFA] text-gray-900 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
    
    <!-- Desktop Sidebar -->
    <aside 
      class="hidden md:flex flex-col flex-shrink-0 border-r border-gray-200/60 bg-white/80 backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden"
      :class="isCollapsed ? 'w-[80px]' : 'w-64'"
    >
      <!-- Sidebar Header -->
      <div class="h-20 flex items-center px-4 relative shrink-0">
        
        <!-- Expanded State -->
        <div 
          class="flex items-center justify-between w-full transition-opacity duration-200"
          :class="isCollapsed ? 'opacity-0 pointer-events-none absolute invisible' : 'opacity-100 delay-100 relative'"
        >
          <div class="flex items-center gap-3 cursor-pointer shrink-0" @click="router.push('/dashboard')">
            <img src="/logo.svg" alt="Logo" class="w-8 h-8 hover:rotate-12 transition-transform" />
            <span class="text-lg font-black tracking-tight text-gray-900 whitespace-nowrap">CBT 小幫手</span>
          </div>
          
          <button 
            @click="isCollapsed = !isCollapsed"
            class="group w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors relative shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            
            <!-- Tooltip (Badge Style) -->
            <span class="absolute -bottom-2 -right-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-sm z-[60] scale-75 group-hover:scale-100 origin-top-left">
              收合
            </span>
          </button>
        </div>

        <!-- Collapsed State (Centered Toggle) -->
        <div 
          class="w-full flex justify-center transition-opacity duration-200"
          :class="isCollapsed ? 'opacity-100 delay-100 relative' : 'opacity-0 pointer-events-none absolute invisible'"
        >
          <button 
            @click="isCollapsed = !isCollapsed"
            class="group w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md active:scale-90 relative shrink-0"
          >
            <svg class="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            
            <!-- Tooltip (Badge Style) -->
            <span class="absolute -bottom-2 -right-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-sm z-[60] scale-75 group-hover:scale-100 origin-top-left">
              展開
            </span>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 space-y-2 py-4 overflow-y-auto scrollbar-hide">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group relative flex items-center h-12 rounded-2xl transition-all duration-200 ease-out active:scale-95 shrink-0 overflow-hidden"
          :class="[
            isCollapsed ? 'justify-center w-full px-0' : 'px-4 gap-4 w-full',
            item.match($route.path) ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <!-- Icon -->
          <svg 
            class="w-6 h-6 shrink-0 transition-transform duration-300" 
            :class="[
              !isCollapsed && 'group-hover:scale-110',
              item.match($route.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
            ]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>

          <!-- Label (Expanded) -->
          <span 
            class="font-black text-sm whitespace-nowrap transition-all duration-200 origin-left"
            :class="isCollapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 w-auto translate-x-0'"
          >
            {{ item.name }}
          </span>

          <!-- Label (Collapsed: Bottom-Right Badge) -->
          <span 
            v-if="isCollapsed"
            class="absolute bottom-1 right-1 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-sm z-[60] scale-75 group-hover:scale-100 origin-top-left"
            :class="item.match($route.path) ? 'bg-indigo-600' : 'bg-gray-800'"
          >
            {{ item.name }}
          </span>
        </router-link>
      </nav>

      <!-- User Profile (Bottom) -->
      <div class="p-3 border-t border-gray-100 relative">
        <div v-if="user" class="relative">
          <button 
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="w-full flex items-center rounded-2xl hover:bg-gray-50 transition-all active:scale-95 group outline-none"
            :class="isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
              <span class="text-white text-xs font-black">{{ user.email?.substring(0, 2).toUpperCase() }}</span>
            </div>
            
            <div v-if="!isCollapsed" class="flex-1 text-left overflow-hidden">
              <p class="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{{ user.email?.split('@')[0] }}</p>
              <p class="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">Premium</p>
            </div>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div 
              v-if="isUserMenuOpen"
              class="absolute bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[60] origin-bottom-left"
              :class="isCollapsed ? 'left-0 w-48' : 'left-0 w-full'"
            >
              <button @click="handleSignOut" class="w-full text-left px-3 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                登出
              </button>
            </div>
          </Transition>
          <div v-if="isUserMenuOpen" @click="isUserMenuOpen = false" class="fixed inset-0 z-[55] cursor-default"></div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
      <!-- Mobile Header (Visible only on small screens) -->
      <header class="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 sticky top-0">
         <div class="flex items-center gap-2">
           <img src="/logo.svg" alt="Logo" class="w-8 h-8" />
           <span class="text-lg font-black text-gray-900">CBT 小幫手</span>
         </div>
         <div v-if="user" class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {{ user.email?.substring(0, 2).toUpperCase() }}
         </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto w-full p-4 md:p-8 scroll-smooth">
        <slot />
        
        <!-- Desktop Footer -->
        <footer class="mt-20 py-8 border-t border-gray-200/50 text-center hidden md:block">
          <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest">© {{ new Date().getFullYear() }} CBT SaaS Engine. Designed for Clarity.</p>
        </footer>
        <div class="h-24 md:hidden"></div>
      </div>
    </main>

    <!-- Mobile Bottom Navigation (Glass) -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 flex justify-around items-center px-2 py-2 z-50 safe-area-pb shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <router-link 
        v-for="item in navItems"
        :key="item.path"
        :to="item.path" 
        class="flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 relative active:scale-90 group"
        :class="item.match($route.path) ? 'text-indigo-600' : 'text-gray-400'"
      >
        <div class="relative z-10 flex flex-col items-center gap-1">
           <svg class="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
           </svg>
           <span class="text-[10px] font-bold tracking-wide">{{ item.name }}</span>
        </div>
        <div v-if="item.match($route.path)" class="absolute inset-x-6 top-1/2 -translate-y-1/2 h-8 bg-indigo-50 rounded-full -z-0 blur-md"></div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 20px); }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
