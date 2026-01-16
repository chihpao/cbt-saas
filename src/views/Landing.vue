<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import logoUrl from '@/assets/logo.svg?url'
import type { User } from '@supabase/supabase-js'

const router = useRouter()
const user = ref<User | null>(null)

const handleSignOut = async () => {
  await signOut()
  user.value = null
  router.push('/')
}

onMounted(async () => {
  user.value = await getCurrentUser()
  supa.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-gray-900 selection:text-white">
    
    <!-- Navbar -->
    <nav class="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 md:px-12 transition-all">
      <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
        <div class="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
        <span class="font-semibold tracking-tight">CBT SaaS</span>
      </div>
      
      <div class="flex items-center gap-4">
        <template v-if="user">
          <button @click="router.push('/home')" class="text-sm font-medium text-gray-600 hover:text-gray-900">儀表板</button>
          <button @click="handleSignOut" class="text-sm font-medium text-gray-500 hover:text-red-600">登出</button>
        </template>
        <template v-else>
          <button @click="router.push('/login')" class="text-sm font-medium text-gray-600 hover:text-gray-900">登入</button>
          <button @click="router.push('/register')" class="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-sm">
            立即開始
          </button>
        </template>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide">v1.0 公開測試版</span>
      </div>

      <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        掌控你的思緒，<br>
        <span class="text-gray-400">找回生活主導權。</span>
      </h1>
      
      <p class="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        以數據驅動的認知行為治療（CBT）方法。<br class="hidden md:inline">
        透過專為現代人設計的工具，追蹤情緒模式、挑戰認知偏誤，並建立心理韌性。
      </p>

      <div class="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
        <button @click="router.push('/register')" class="h-12 px-8 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5 active:scale-95">
          開始你的旅程
        </button>
        <button class="h-12 px-8 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-95">
          了解運作原理
        </button>
      </div>

      <!-- Abstract UI Mockup -->
      <div class="mt-20 w-full max-w-5xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
         <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent blur-3xl -z-10 rounded-full"></div>
         <div class="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] relative">
            <!-- Mockup Header -->
            <div class="h-12 border-b border-gray-100 flex items-center px-4 gap-2">
              <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
                <div class="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
              </div>
            </div>
            <!-- Mockup Body -->
            <div class="p-8 grid grid-cols-3 gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
               <div class="col-span-2 space-y-4">
                 <div class="h-8 w-1/3 bg-gray-100 rounded-lg"></div>
                 <div class="h-32 bg-gray-50 rounded-xl border border-gray-100"></div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="h-24 bg-indigo-50 rounded-xl border border-indigo-100"></div>
                    <div class="h-24 bg-gray-50 rounded-xl border border-gray-100"></div>
                 </div>
               </div>
               <div class="space-y-4">
                 <div class="h-full bg-gray-50 rounded-xl border border-gray-100"></div>
               </div>
            </div>
            <!-- Overlay Text -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="bg-white/90 backdrop-blur border border-gray-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 shadow-sm">
                儀表板預覽
              </span>
            </div>
         </div>
      </div>
    </section>

    <!-- Bento Grid Features -->
    <section class="py-24 px-6 md:px-12 bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Feature 1 -->
          <div class="md:col-span-2 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 relative overflow-hidden group">
             <div class="relative z-10 max-w-md">
               <h3 class="text-2xl font-bold text-gray-900 mb-3">結構化的清晰感</h3>
               <p class="text-gray-500 leading-relaxed">
                 將令人不知所措的情緒分解為可管理的數據。以臨床級的精準度識別觸發點、認知偏誤與情緒模式。
               </p>
             </div>
             <div class="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Feature 2 -->
          <div class="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-between group">
             <div>
               <h3 class="text-2xl font-bold mb-3">隱私優先</h3>
               <p class="text-indigo-100 opacity-80 leading-relaxed">
                 你的心理狀態是私密的。你的數據經過加密保護，且僅屬於你。
               </p>
             </div>
             <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mt-8 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 hover:border-indigo-200 transition-colors">
            <h3 class="text-xl font-bold text-gray-900 mb-2">引導式日誌</h3>
            <p class="text-sm text-gray-500 mb-6">透過步驟式引導，協助你挑戰負面想法。</p>
            <div class="space-y-2">
              <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-500 w-3/4"></div></div>
              <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-gray-300 w-1/2"></div></div>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 hover:border-gray-300 transition-colors flex items-center justify-between">
             <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">隨時隨地</h3>
                <p class="text-gray-500">針對所有裝置優化。你的隨身心理治療師。</p>
             </div>
             <div class="flex gap-2">
               <div class="w-10 h-16 border-2 border-gray-200 rounded-lg bg-gray-50"></div>
               <div class="w-24 h-16 border-2 border-gray-200 rounded-lg bg-gray-50"></div>
             </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-12 px-6">
       <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
         <div class="text-sm text-gray-500 font-medium">© 2026 CBT SaaS. 為清晰而生。</div>
         <div class="flex gap-6 text-sm font-medium text-gray-500">
           <a href="#" class="hover:text-gray-900">隱私權</a>
           <a href="#" class="hover:text-gray-900">服務條款</a>
           <a href="#" class="hover:text-gray-900">聯絡我們</a>
         </div>
       </div>
    </footer>

  </div>
</template>