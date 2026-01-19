<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import type { User } from '@supabase/supabase-js'

const router = useRouter()
const user = ref<User | null>(null)

// --- Language State ---
const lang = ref<'zh' | 'en'>('zh')

const t = computed(() => ({
  nav: {
    dashboard: lang.value === 'zh' ? '儀表板' : 'Dashboard',
    signout: lang.value === 'zh' ? '登出' : 'Sign Out',
    login: lang.value === 'zh' ? '登入 / 註冊' : 'Login / Join',
    switchBtn: lang.value === 'zh' ? 'EN' : '繁中'
  },
  loader: {
    words: lang.value === 'zh' 
      ? ['初始化...', '分析情緒...', '建構邏輯...', '準備就緒'] 
      : ['INITIALIZING...', 'ANALYZING...', 'RESTRUCTURING...', 'READY'],
  },
  hero: {
    line1: lang.value === 'zh' ? '重塑' : 'REWIRE',
    line2: lang.value === 'zh' ? '你的' : 'YOUR',
    line3: lang.value === 'zh' ? '思維' : 'MINDSET',
    sub: lang.value === 'zh' ? '數據驅動的現代心理治療工具。\n專為追求卓越的心靈設計。' : 'DATA DRIVEN THERAPY TOOLS.\nDESIGNED FOR THE MODERN MIND.',
    scroll: lang.value === 'zh' ? '向下滑動以探索' : 'SCROLL TO EXPLORE'
  },
  features: {
    title: lang.value === 'zh' ? '核心功能' : 'Core Features',
    c1_title: lang.value === 'zh' ? '認知重塑' : 'Cognitive Restructuring',
    c1_desc: lang.value === 'zh' ? '將混亂的情緒轉化為有序的數據。使用標準化的 CBT 模型，協助你精準識別觸發點、自動化想法與情緒反應。' : 'Transform chaotic emotions into structured data. We use standardized CBT models.',
    c2_title: lang.value === 'zh' ? '隱私保護' : 'Privacy Protection',
    c2_desc: lang.value === 'zh' ? '你的心靈是神聖的領域。我們採用軍用級加密技術，確保你的日誌與情緒數據僅有你能存取。' : 'Your mind is a sanctuary. We employ military-grade encryption.',
    c3_title: lang.value === 'zh' ? '引導式日誌' : 'Guided Journaling',
    c3_desc: lang.value === 'zh' ? '不知道從何開始？我們的適應性引導將帶領你穿越迷霧，協助你拆解核心信念並打破負面迴圈。' : 'Adaptive prompts guide you through the fog.',
    c4_title: lang.value === 'zh' ? '全平台同步' : 'Cross-Platform Sync',
    c4_desc: lang.value === 'zh' ? '無論身在何處，心理支持隨手可得。數據即時同步於所有裝置。' : 'Real-time data synchronization across all devices.'
  },
  cta: {
    title: lang.value === 'zh' ? '立即開始' : 'START NOW.',
    sub: lang.value === 'zh' ? '加入數千名使用者的行列，透過數據找回心靈的主導權。' : 'Join the thousands using data to reclaim their peace of mind.',
    btn: lang.value === 'zh' ? '建立免費帳戶' : 'Create Account'
  },
  footer: {
    copy: lang.value === 'zh' ? 'CBT SaaS © 2026\n台北市，台灣' : 'CBT SaaS © 2026\nTaipei City, Taiwan',
    privacy: lang.value === 'zh' ? '隱私權' : 'Privacy',
    terms: lang.value === 'zh' ? '服務條款' : 'Terms',
    contact: lang.value === 'zh' ? '聯絡我們' : 'Contact'
  }
}))

const toggleLang = () => {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
}

// --- Loading State ---
const isLoading = ref(true)
const loadingPercentage = ref(0)
const loadingWord = ref('')
const isRevealed = ref(false)

// --- Scroll & Mouse State ---
const mouseX = ref(-100)
const mouseY = ref(-100)
const cursorHover = ref(false)
const stickySection = ref<HTMLElement | null>(null)
const horizontalTrack = ref<HTMLElement | null>(null)
const scrollProgress = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// Optimized Scroll Handler using requestAnimationFrame
let reqId: number | null = null

const updateScroll = () => {
  if (!stickySection.value || !horizontalTrack.value) return

  const stickyTop = stickySection.value.getBoundingClientRect().top
  const stickyHeight = stickySection.value.offsetHeight
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  
  // The distance the sticky section can be "scrolled" relative to the viewport
  // We want the scroll to start when the top of the section hits the top of the viewport (0)
  // And end when the bottom of the section hits the bottom of the viewport (which means the top is at -(stickyHeight - viewportHeight))
  
  const maxScrollDistance = stickyHeight - viewportHeight
  
  // Calculate raw progress based on how far we've scrolled into the section
  // -stickyTop gives us the amount of the section that has scrolled UP past the top of the viewport
  let rawProgress = -stickyTop / maxScrollDistance
  
  // Clamp between 0 and 1
  const progress = Math.max(0, Math.min(rawProgress, 1))
  scrollProgress.value = progress

  // Calculate horizontal translation
  // We want to move the track to the left, so we use a negative value
  // The maximum translation is the total width of the track minus one viewport width (so the last slide stops exactly in view)
  const trackWidth = horizontalTrack.value.scrollWidth
  const maxTranslate = trackWidth - viewportWidth
  const translateX = maxTranslate * progress

  horizontalTrack.value.style.transform = `translate3d(${-translateX}px, 0, 0)`
  
  reqId = null
}

const handleScroll = () => {
  if (!reqId) {
    reqId = requestAnimationFrame(updateScroll)
  }
}

const handleSignOut = async () => {
  await signOut()
  user.value = null
  router.push('/')
}

const scrollToFeatures = () => {
  if (stickySection.value) {
    stickySection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// --- Lifecycle ---
onMounted(async () => {
  user.value = await getCurrentUser()
  supa.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleScroll)

  // Loader Logic
  let wordIndex = 0
  loadingWord.value = t.value.loader.words[0] || 'INIT...'
  
  const wordInterval = setInterval(() => {
    wordIndex = (wordIndex + 1) % t.value.loader.words.length
    loadingWord.value = t.value.loader.words[wordIndex] || 'LOADING...'
  }, 400)

  const progressInterval = setInterval(() => {
    const diff = Math.floor(Math.random() * 8) + 1
    loadingPercentage.value = Math.min(loadingPercentage.value + diff, 100)
    
    if (loadingPercentage.value >= 100) {
      clearInterval(progressInterval)
      clearInterval(wordInterval)
      loadingWord.value = t.value.loader.words[t.value.loader.words.length - 1] || 'READY'
      
      setTimeout(() => {
        isLoading.value = false
        setTimeout(() => {
          isRevealed.value = true 
          // Initial trigger to set positions correctly
          updateScroll()
        }, 1000)
      }, 600)
    }
  }, 50)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
  if (reqId) cancelAnimationFrame(reqId)
})
</script>

<template>
  <div class="min-h-screen bg-[#FDFDFD] font-sans text-black selection:bg-black selection:text-white cursor-none relative transition-colors duration-500">
    
    <!-- === CUSTOM CURSOR === -->
    <div 
      class="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out flex items-center justify-center"
      :style="{ left: mouseX + 'px', top: mouseY + 'px', transform: 'translate(-50%, -50%)' }"
    >
      <div 
        class="bg-white rounded-full transition-all duration-300 ease-out"
        :class="cursorHover ? 'w-24 h-24 opacity-100' : 'w-4 h-4 opacity-100'"
      ></div>
      <span v-if="cursorHover" class="absolute text-[10px] font-bold tracking-widest text-black uppercase">View</span>
    </div>

    <!-- === LOADER === -->
    <div class="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between" :class="{ 'pointer-events-none': !isLoading }">
       <div class="absolute inset-0 flex h-full w-full">
          <div class="h-full w-1/3 bg-black transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] origin-top" :class="isLoading ? 'scale-y-100' : 'scale-y-0 delay-100'"></div>
          <div class="h-full w-1/3 bg-black transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] origin-bottom" :class="isLoading ? 'scale-y-100' : 'scale-y-0 delay-200'"></div>
          <div class="h-full w-1/3 bg-black transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] origin-top" :class="isLoading ? 'scale-y-100' : 'scale-y-0 delay-300'"></div>
       </div>
       <div class="absolute inset-0 flex flex-col justify-between p-12 text-white transition-opacity duration-500" :class="{ 'opacity-0': !isLoading }">
          <div class="flex justify-between font-mono text-xs tracking-widest">
             <span>CBT-OS</span><span>{{ loadingPercentage }}%</span>
          </div>
          <div class="text-[8vw] leading-none font-bold tracking-tighter uppercase tabular-nums">
             {{ loadingWord }}
          </div>
          <div class="font-mono text-xs tracking-widest">INITIALIZING SYSTEM CORE...</div>
       </div>
    </div>

    <!-- === NAVBAR === -->
    <nav class="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-6 mix-blend-difference text-white transition-transform duration-1000 delay-1000"
         :class="isLoading ? '-translate-y-full' : 'translate-y-0'">
      <div class="flex items-center gap-2 cursor-pointer group" @click="router.push('/')" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">
        <div class="w-3 h-3 bg-white rounded-full group-hover:scale-150 transition-transform"></div>
        <span class="font-bold tracking-widest uppercase text-sm">CBT SaaS</span>
      </div>
      
      <div class="flex items-center gap-8">
        <button @click="toggleLang" class="border border-white/30 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest hover:bg-white hover:text-black transition-all" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">
          {{ t.nav.switchBtn }}
        </button>
        <template v-if="user">
          <button @click="router.push('/home')" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.nav.dashboard }}</button>
          <button @click="handleSignOut" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.nav.signout }}</button>
        </template>
        <template v-else>
          <button @click="router.push('/login')" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.nav.login }}</button>
        </template>
      </div>
    </nav>

    <!-- === HERO === -->
    <header class="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 overflow-hidden bg-[#FDFDFD]">
       <div class="absolute inset-0 z-0 opacity-0 transition-opacity duration-[2s] delay-700" :class="{ 'opacity-100': isRevealed }">
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div class="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
          <div class="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
       </div>

       <div class="relative z-10 w-full flex flex-col justify-center">
          <div class="max-w-[90vw]">
             <h1 class="text-[13vw] leading-[0.9] font-black tracking-tighter text-black mix-blend-overlay opacity-0 translate-y-20 transition-all duration-1000 delay-1000" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line1 }}
             </h1>
             <h1 class="text-[13vw] leading-[0.9] font-black tracking-tighter text-black ml-[5vw] md:ml-[10vw] mix-blend-overlay opacity-0 translate-y-20 transition-all duration-1000 delay-[1100ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line2 }}
             </h1>
             <h1 class="text-[13vw] leading-[0.9] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-black opacity-0 translate-y-20 transition-all duration-1000 delay-[1200ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line3 }}
             </h1>
          </div>

          <div class="relative z-30 mt-16 max-w-sm opacity-0 transition-opacity duration-1000 delay-[1500ms]" :class="{ 'opacity-100': isRevealed }">
             <p class="text-sm font-mono leading-relaxed mb-6 whitespace-pre-line text-gray-600">
                {{ t.hero.sub }}
             </p>
             <div class="h-[1px] w-20 bg-black mb-4"></div>
             <button @click="scrollToFeatures" class="uppercase text-xs font-bold tracking-widest hover:pl-4 transition-all" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">
                {{ t.hero.scroll }}
             </button>
          </div>
       </div>
    </header>

    <!-- === HORIZONTAL SCROLL SECTION === -->
    <!-- Height is calculated to allow enough scroll space. 500vh gives us plenty of 'track' -->
    <div ref="stickySection" class="relative h-[500vh] bg-black">
       <div class="sticky top-0 h-screen w-screen overflow-hidden flex items-center">
          
          <!-- Track -->
          <div ref="horizontalTrack" class="flex h-full w-full will-change-transform">
             
             <!-- SLIDE 1: Structure (Glass/Blur) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-[#F5F5F7]">
                <!-- Dynamic Background -->
                <div class="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-[#E0E0E0] rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
                <div class="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#D6D6D6] rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
                
                <div class="relative z-10 w-full max-w-[90vw] grid md:grid-cols-12 gap-8 items-end">
                   <div class="md:col-span-8 relative">
                      <div class="overflow-hidden mb-4">
                         <div class="text-[12rem] md:text-[16rem] font-black tracking-[-0.06em] leading-[0.8] text-black/5 select-none absolute -top-32 -left-10 z-0">01</div>
                         <h2 class="text-6xl md:text-[8vw] font-black tracking-[-0.05em] leading-[0.9] text-black relative z-10 will-change-transform" 
                             :style="{ transform: `translateY(${scrollProgress * 100}px)` }">
                            {{ t.features.c1_title }}
                         </h2>
                      </div>
                      <div class="h-[1px] w-0 bg-black mb-8 transition-all duration-1000 delay-300" :class="{ 'w-24': scrollProgress > 0.05 }"></div>
                      <p class="text-xl md:text-2xl text-gray-500 max-w-xl font-medium tracking-tight leading-relaxed">
                         {{ t.features.c1_desc }}
                      </p>
                   </div>
                   
                   <!-- Interactive Glass Card -->
                   <div class="md:col-span-4 h-[50vh] w-full bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700">
                      <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div class="relative z-10 text-center mix-blend-overlay">
                         <div class="text-8xl mb-6 group-hover:-translate-y-4 transition-transform duration-500">🧠</div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- SLIDE 2: Privacy (Dark/Cyber -> Expansion) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-black text-white">
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                <!-- THE EXPANDING CIRCLE -->
                <!-- We want this to expand as we scroll from roughly 0.3 (center of slide 2) to 0.6 (transition to slide 3) -->
                <!-- Mapping: 0.3 -> 1x, 0.6 -> 60x -->
                <div 
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] border-[1px] border-white rounded-full flex items-center justify-center transition-transform duration-75 will-change-transform z-0"
                  :style="{ 
                    transform: `translate(-50%, -50%) scale(${Math.max(1, (scrollProgress - 0.25) * 80)})`,
                    borderWidth: `${Math.max(1, 100 * (0.6 - scrollProgress))}px`, // Border gets thinner as it expands? Or thicker? Let's keep it 1px visual but maybe fading opacity
                    opacity: scrollProgress > 0.6 ? 0 : 1, // Hide after it fills screen to reveal next slide naturally? Or let it BE the white background
                    backgroundColor: scrollProgress > 0.35 ? '#FFFFFF' : 'transparent', // Turn WHITE at a certain point to fill screen
                    borderColor: scrollProgress > 0.35 ? 'transparent' : '#FFFFFF'
                  }"
                >
                </div>

                <div class="relative z-10 w-full max-w-[90vw] text-center mix-blend-difference">
                   <!-- Content fades out as circle expands -->
                   <div :style="{ opacity: Math.max(0, 1 - (scrollProgress - 0.3) * 10) }">
                      <div class="inline-flex items-center gap-3 px-4 py-1 border border-white/30 rounded-full mb-12">
                         <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                         <span class="text-xs font-mono tracking-widest uppercase">Encrypted Vault</span>
                      </div>
                      <h2 class="text-[12vw] leading-[0.8] font-black tracking-[-0.08em] mb-8">
                         {{ t.features.c2_title }}
                      </h2>
                      <p class="text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-tight">
                         {{ t.features.c2_desc }}
                      </p>
                   </div>
                </div>
             </div>

             <!-- SLIDE 3: Journal (Iridescent -> Revealed by White Circle) -->
             <!-- Since Slide 2 circle turns white and expands, Slide 3 should ideally have a white base or transition smoothly -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-white">
                <div class="absolute inset-0 bg-gradient-to-tr from-rose-50 via-slate-50 to-indigo-50 opacity-80"></div>
                
                <div class="relative z-10 w-full max-w-[85vw] grid md:grid-cols-2 gap-24 items-center">
                   <div class="space-y-10">
                       <div class="overflow-hidden">
                           <h2 class="text-[10vw] leading-[0.85] font-black tracking-[-0.06em] text-black">
                             {{ t.features.c3_title }}
                           </h2>
                       </div>
                       <p class="text-3xl text-gray-500 font-medium tracking-tight leading-tight max-w-lg">
                         {{ t.features.c3_desc }}
                       </p>
                       <div class="flex gap-4 pt-8">
                          <div class="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-500">
                             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </div>
                       </div>
                   </div>
                   
                   <div class="relative perspective-1000">
                      <!-- 3D Floating Cards -->
                      <div class="bg-white p-10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-gray-100 rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                         <div class="flex items-center justify-between mb-8 opacity-50">
                            <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div class="w-20 h-2 bg-gray-200 rounded-full"></div>
                         </div>
                         <div class="space-y-4">
                            <div class="h-4 w-full bg-gray-100 rounded-full"></div>
                            <div class="h-4 w-5/6 bg-gray-100 rounded-full"></div>
                            <div class="h-4 w-4/6 bg-gray-100 rounded-full"></div>
                         </div>
                         <div class="mt-8 flex gap-2">
                            <div class="h-8 w-20 bg-indigo-50 rounded-lg"></div>
                            <div class="h-8 w-20 bg-rose-50 rounded-lg"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- SLIDE 4: Sync (Structured/Grid) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-[#F2F2F2]">
                <div class="absolute inset-0" style="background-image: linear-gradient(#D4D4D4 1px, transparent 1px), linear-gradient(90deg, #D4D4D4 1px, transparent 1px); background-size: 50px 50px;"></div>
                
                <div class="relative z-10 w-full max-w-[90vw] flex flex-col items-center text-center">
                   <div class="mb-16 flex gap-12">
                      <div class="group relative">
                         <div class="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-4xl group-hover:-translate-y-4 transition-transform duration-500 z-10 relative">📱</div>
                         <div class="absolute inset-0 bg-black rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      </div>
                      <div class="group relative mt-12">
                         <div class="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-4xl group-hover:-translate-y-4 transition-transform duration-500 z-10 relative">💻</div>
                         <div class="absolute inset-0 bg-black rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      </div>
                   </div>
                   
                   <h2 class="text-[12vw] leading-[0.8] font-black tracking-[-0.08em] text-black mb-10 mix-blend-darken uppercase">
                      {{ t.features.c4_title }}
                   </h2>
                   
                   <div class="max-w-xl mx-auto backdrop-blur-sm bg-white/50 p-6 rounded-2xl border border-black/5">
                      <p class="text-xl text-black font-mono tracking-tighter">
                         {{ t.features.c4_desc }}
                      </p>
                   </div>
                </div>
             </div>

          </div>
          
          <!-- Progress Bar (Sticky Bottom) -->
          <div class="absolute bottom-12 left-12 right-12 mix-blend-difference z-50">
             <div class="h-[2px] w-full bg-white/20 overflow-hidden">
                <div class="h-full bg-white transition-transform duration-75 ease-linear will-change-transform" :style="{ transform: `scaleX(${scrollProgress})`, transformOrigin: 'left' }"></div>
             </div>
             <div class="flex justify-between mt-2 font-mono text-[10px] text-white/50 tracking-widest uppercase">
                 <span>Start</span>
                 <span>End</span>
             </div>
          </div>

       </div>
    </div>

    <!-- === CALL TO ACTION === -->
    <section class="py-40 px-6 md:px-12 bg-black text-[#EAEAEA] text-center relative overflow-hidden">
       <div class="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" class="w-full h-full object-cover grayscale" alt="Noise">
       </div>
       
       <div class="relative z-10 max-w-4xl mx-auto">
          <h2 class="text-5xl md:text-9xl font-black tracking-tighter mb-12 mix-blend-difference">
             {{ t.cta.title }}
          </h2>
          <p class="text-xl md:text-3xl text-gray-400 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
             {{ t.cta.sub }}
          </p>
          <button 
             @click="router.push('/register')" 
             class="px-16 py-6 bg-white text-black rounded-full font-bold text-xl tracking-widest uppercase hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-105"
             @mouseenter="cursorHover = true" @mouseleave="cursorHover = false"
          >
             {{ t.cta.btn }}
          </button>
       </div>
    </section>

    <!-- === FOOTER === -->
    <footer class="px-6 py-12 flex flex-col md:flex-row justify-between items-end bg-black text-white/40 text-xs font-mono uppercase tracking-widest border-t border-white/10">
       <div class="mb-8 md:mb-0 whitespace-pre-line leading-relaxed">
          {{ t.footer.copy }}
       </div>
       <div class="flex flex-col md:flex-row gap-8">
          <router-link to="/privacy" class="hover:text-white transition-colors" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.footer.privacy }}</router-link>
          <router-link to="/terms" class="hover:text-white transition-colors" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.footer.terms }}</router-link>
          <a href="mailto:hello@cbtsaas.com" class="hover:text-white transition-colors" @mouseenter="cursorHover = true" @mouseleave="cursorHover = false">{{ t.footer.contact }}</a>
       </div>
    </footer>

  </div>
</template>

<style scoped>
/* Animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 10s infinite; }
.animation-delay-2000 { animation-delay: 2s; }

@keyframes spin-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 20s linear infinite; }
</style>