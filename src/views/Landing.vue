<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, signOut, supa } from '@/services/supaClient'
import IconBrain from '@/components/icons/IconBrain.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconReflection from '@/components/icons/IconReflection.vue'
import IconDevices from '@/components/icons/IconDevices.vue'
import IconClock from '@/components/icons/IconClock.vue'
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
    sub: lang.value === 'zh' ? '數據驅動的現代心理治療工具\n專為追求卓越的心靈設計' : 'DATA DRIVEN THERAPY TOOLS\nDESIGNED FOR THE MODERN MIND',
    scroll: lang.value === 'zh' ? '向下滑動以探索' : 'SCROLL TO EXPLORE'
  },
  features: {
    title: lang.value === 'zh' ? '核心功能' : 'Core Features',
    c1_title: lang.value === 'zh' ? '認知重塑' : 'Cognitive Restructuring',
    c1_desc: lang.value === 'zh' ? '將混亂的情緒轉化為有序的數據。使用標準化的 CBT 模型，協助你精準識別觸發點、自動化想法與情緒反應。' : 'Transform chaotic emotions into structured data. We use standardized CBT models.',
    c1_meta: lang.value === 'zh' ? 'CBT 模型 v3' : 'CBT Model v3',
    c2_title: lang.value === 'zh' ? '隱私保護' : 'Privacy Protection',
    c2_desc: lang.value === 'zh' ? '你的心靈是神聖的領域。我們採用軍用級加密技術，確保你的日誌與情緒數據僅有你能存取。' : 'Your mind is a sanctuary. We employ military-grade encryption.',
    c2_badge: lang.value === 'zh' ? '加密保護中' : 'Encrypted Vault',
    c3_title: lang.value === 'zh' ? '引導式日誌' : 'Guided Journaling',
    c3_desc: lang.value === 'zh' ? '不知道從何開始？我們的適應性引導將帶領你穿越迷霧，協助你拆解核心信念並打破負面迴圈。' : 'Adaptive prompts guide you through the fog.',
    c4_title: lang.value === 'zh' ? '全平台同步' : 'Cross-Platform Sync',
    c4_desc: lang.value === 'zh' ? '無論身在何處，心理支持隨手可得。數據即時同步於所有裝置。' : 'Real-time data synchronization across all devices.',
    c4_tag1: lang.value === 'zh' ? '多裝置同步' : 'Multi-Device',
    c4_tag2: lang.value === 'zh' ? '即時更新' : 'Real-time'
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
const rainCanvas = ref<HTMLCanvasElement | null>(null)
const heroSpotlightStyle = computed(() => ({
  backgroundImage: `radial-gradient(700px at ${mouseX.value}px ${mouseY.value}px, rgba(99, 102, 241, 0.16), transparent 65%)`
}))

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const checkHover = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target) return
  
  const tag = target.tagName.toUpperCase()
  // P, H1-H6, SPAN, LI, B, STRONG, I, EM, SMALL, BLOCKQUOTE
  const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'LI', 'B', 'STRONG', 'I', 'EM', 'SMALL', 'BLOCKQUOTE']
  // BUTTON, A, INPUT, TEXTAREA, SELECT, LABEL, SVG, PATH
  const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL', 'SVG', 'PATH']
  
  const isText = textTags.includes(tag)
  const isInteractive = interactiveTags.includes(tag) || window.getComputedStyle(target).cursor === 'pointer'
  
  cursorHover.value = isText || isInteractive
}

// Optimized Scroll Handler using requestAnimationFrame
let reqId: number | null = null
let rainReqId: number | null = null
let mouseReqId: number | null = null

// Mouse Physics State (Normalized -1 to 1)
const smoothMouseX = ref(0)
const smoothMouseY = ref(0)

const updateMousePhysics = () => {
  // Normalize target (-1 to 1)
  // Center of screen is 0,0
  const targetX = (mouseX.value / window.innerWidth) * 2 - 1
  const targetY = (mouseY.value / window.innerHeight) * 2 - 1
  
  // Lerp for heavy/smooth feel (0.05 factor)
  smoothMouseX.value += (targetX - smoothMouseX.value) * 0.05
  smoothMouseY.value += (targetY - smoothMouseY.value) * 0.05
  
  mouseReqId = requestAnimationFrame(updateMousePhysics)
}

// Quartic Easing for sharper, premium "Whoosh" feel
const easeInOutQuart = (x: number): number => {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

// Crisp Mapping: Absolute Lock -> Fast Transition -> Absolute Lock
// No "muddy" drifting. 
const mapProgressToSteps = (p: number, totalSlides: number) => {
  // We divide the scroll distance into N-1 transition zones.
  const transitions = totalSlides - 1
  const zoneSize = 1 / transitions
  
  const currentZone = Math.min(Math.floor(p / zoneSize), transitions - 1)
  const localP = (p - (currentZone * zoneSize)) / zoneSize
  
  // 75% of the scroll space is purely for reading (Static).
  // 25% is for the transition.
  const holdRatio = 0.75
  
  if (localP <= holdRatio) {
     // ABSOLUTE LOCK. No drift.
     return currentZone
  } else {
     // FAST TRANSITION
     const transP = (localP - holdRatio) / (1 - holdRatio)
     return currentZone + easeInOutQuart(transP)
  }
}

const updateScroll = () => {
  if (!stickySection.value || !horizontalTrack.value) return

  const stickyTop = stickySection.value.getBoundingClientRect().top
  const stickyHeight = stickySection.value.offsetHeight
  const viewportHeight = window.innerHeight
  
  const maxScrollDistance = stickyHeight - viewportHeight
  
  let rawProgress = -stickyTop / maxScrollDistance
  const progress = Math.max(0, Math.min(rawProgress, 1))
  
  scrollProgress.value = progress

  // Direct calculation - CRISP RESPONSE
  const stepped = mapProgressToSteps(progress, 4)

  // Apply Transform to Track
  const viewportWidth = window.innerWidth
  const translateX = viewportWidth * stepped
  horizontalTrack.value.style.transform = `translate3d(${-translateX}px, 0, 0)`
  
  reqId = null
}

const handleScroll = () => {
  if (!reqId) {
    reqId = requestAnimationFrame(updateScroll)
  }
}

// Unified Slide Progress computed directly from scrollProgress
const slideProgress = computed(() => {
  const p = mapProgressToSteps(scrollProgress.value, 4)
  return {
    s1: Math.max(0, 1 - Math.abs(p - 0)),
    s2: Math.max(0, 1 - Math.abs(p - 1)),
    s3: Math.max(0, 1 - Math.abs(p - 2)),
    s4: Math.max(0, 1 - Math.abs(p - 3)),
    raw: p
  }
})

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

// --- CTA Intersection Observer ---
const ctaSection = ref<HTMLElement | null>(null)
const ctaVisible = ref(false)

onMounted(async () => {
  // ... existing matrix rain logic ...
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ctaVisible.value = true
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.3 })
  
  if (ctaSection.value) {
    observer.observe(ctaSection.value)
  }

  if (rainCanvas.value) {

    const canvas = rainCanvas.value
    const ctx = canvas.getContext('2d')
    if (ctx) {
      let width = window.innerWidth
      let height = window.innerHeight
      
      interface Drop {
        x: number
        y: number
        z: number // depth 0.2 to 1.5
        speed: number
        chars: string[]
        maxLen: number
      }
      
      let drops: Drop[] = []
      const baseFontSize = 14
      let hue = 0
      
      const initDrops = () => {
         drops = []
         const count = Math.floor(width / 15) // Density
         for(let i=0; i<count; i++) {
            addDrop(true)
         }
      }
      
      const addDrop = (randomY = false) => {
         const z = Math.random() * 0.8 + 0.2 
         const size = Math.floor(baseFontSize * z)
         const len = Math.floor(Math.random() * 15 + 5)
         drops.push({
            x: Math.random() * width,
            y: randomY ? Math.random() * height : -100 - (len * size),
            z: z,
            speed: (Math.random() * 3 + 1) * z, 
            chars: Array(len).fill('').map(() => Math.random() > 0.5 ? '1' : '0'),
            maxLen: len
         })
      }

      const resize = () => {
         width = window.innerWidth
         height = window.innerHeight
         canvas.width = width
         canvas.height = height
         initDrops()
      }
      
      const drawRain = () => {
        ctx.clearRect(0, 0, width, height)
        hue = (hue + 0.2) % 360
        
        ctx.textBaseline = 'top'
        
        drops.forEach((drop, idx) => {
          drop.y += drop.speed
          
          if (Math.random() > 0.96) {
             drop.chars[Math.floor(Math.random() * drop.chars.length)] = Math.random() > 0.5 ? '1' : '0'
          }
          
          const size = Math.floor(baseFontSize * ((drop.z * 1.5) + 0.5))
          ctx.font = `700 ${size}px monospace`
          
          drop.chars.forEach((char, charIdx) => {
             const charY = drop.y - (charIdx * size * 1.1)
             if (charY > height + 50 || charY < -50) return

             const fade = 1 - (charIdx / drop.maxLen)
             const opacity = drop.z * fade * 0.6
             
             if (charIdx === 0) {
                 ctx.fillStyle = `hsla(${hue}, 100%, 90%, ${opacity})`
                 // Add subtle glow to head
                 ctx.shadowBlur = 10
                 ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${opacity})`
             } else {
                 ctx.fillStyle = `hsla(${hue}, 60%, 50%, ${opacity})`
                 ctx.shadowBlur = 0
             }
             
             ctx.fillText(char, drop.x, charY)
          })
          
          // Reset shadow
          ctx.shadowBlur = 0

          if (drop.y - (drop.maxLen * size * 1.1) > height) {
             const newZ = Math.random() * 0.8 + 0.2
             drops[idx] = {
                x: Math.random() * width,
                y: -100,
                z: newZ,
                speed: (Math.random() * 3 + 1) * newZ,
                chars: Array(Math.floor(Math.random() * 15 + 5)).fill('').map(() => Math.random() > 0.5 ? '1' : '0'),
                maxLen: Math.floor(Math.random() * 15 + 5)
             }
          }
        })
        
        rainReqId = requestAnimationFrame(drawRain)
      }

      resize()
      window.addEventListener('resize', resize)
      drawRain()
    }
  }

  user.value = await getCurrentUser()
  supa.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseover', checkHover)
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleScroll)

  if (mouseX.value < 0) {
    mouseX.value = window.innerWidth / 2
    mouseY.value = window.innerHeight * 0.45
  }

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
          // Initial trigger
          updateScroll()
          // Start Mouse Physics
          updateMousePhysics()
        }, 1000)
      }, 600)
    }
  }, 50)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseover', checkHover)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
  if (reqId) cancelAnimationFrame(reqId)
  if (rainReqId) cancelAnimationFrame(rainReqId)
  if (mouseReqId) cancelAnimationFrame(mouseReqId)
})
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-700 relative transition-colors duration-500 md:cursor-none">
    
    <!-- === CUSTOM CURSOR === -->
    <div 
      class="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out hidden md:flex items-center justify-center"
      :style="{ left: mouseX + 'px', top: mouseY + 'px', transform: 'translate(-50%, -50%)' }"
    >
      <div 
        class="bg-white rounded-full transition-all duration-300 ease-out"
        :class="cursorHover ? 'w-20 h-20 opacity-100' : 'w-4 h-4 opacity-100'"
      ></div>
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
             <span>CBT SAAS</span><span>{{ loadingPercentage }}%</span>
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
      <div class="flex items-center gap-2 cursor-pointer group" @click="router.push('/')">
        <div class="w-3 h-3 bg-white rounded-full group-hover:scale-150 transition-transform"></div>
        <span class="font-bold tracking-widest uppercase text-sm">CBT SaaS</span>
      </div>
      
      <div class="flex items-center gap-8">
        <button @click="toggleLang" class="border border-white/30 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest hover:bg-white hover:text-black transition-all">
          {{ t.nav.switchBtn }}
        </button>
        <template v-if="user">
          <button @click="router.push('/home')" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">{{ t.nav.dashboard }}</button>
          <button @click="handleSignOut" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">{{ t.nav.signout }}</button>
        </template>
        <template v-else>
          <button @click="router.push('/login')" class="text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">{{ t.nav.login }}</button>
        </template>
      </div>
    </nav>

    <!-- === HERO === -->
    <header class="relative min-h-screen flex flex-col justify-center px-6 md:px-12 overflow-hidden bg-[#F8FAFC]">
       <div class="absolute inset-0 z-0 pointer-events-none opacity-0 transition-opacity duration-[2s] delay-700" :class="{ 'opacity-100': isRevealed }">
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div class="absolute inset-0 opacity-[0.08]" style="background-image: linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px); background-size: 120px 120px;"></div>
          
          <div class="absolute inset-0 transition-opacity duration-500" :style="heroSpotlightStyle"></div>
          <div class="absolute top-1/4 -right-24 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
          <div class="absolute -bottom-24 -left-24 w-[520px] h-[520px] bg-blue-100 rounded-full blur-[110px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>

                    <!-- Digital Rain / Data Noise (Canvas) -->
          <canvas ref="rainCanvas" class="absolute inset-0 z-0 pointer-events-none mix-blend-darken opacity-80"></canvas>
       </div>

       <div class="relative z-10 w-full flex flex-col justify-center md:block">
          <div class="max-w-[90vw] md:max-w-none">
             <h1 class="text-[13vw] xl:text-[11rem] leading-[0.9] font-black tracking-tighter text-black mix-blend-overlay opacity-0 translate-y-20 transition-all duration-1000 delay-1000" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line1 }}
             </h1>
             <h1 class="text-[13vw] xl:text-[11rem] leading-[0.9] font-black tracking-tighter text-black ml-[5vw] md:ml-[10vw] mix-blend-overlay opacity-0 translate-y-20 transition-all duration-1000 delay-[1100ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line2 }}
             </h1>
             <h1 class="text-[13vw] xl:text-[11rem] leading-[0.9] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-black opacity-0 translate-y-20 transition-all duration-1000 delay-[1200ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
                {{ t.hero.line3 }}
             </h1>
          </div>

          <div class="relative z-30 mt-5 md:ml-[10vw] max-w-lg opacity-0 translate-y-6 transition-all duration-1000 delay-[1500ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
             <div class="h-[1px] w-20 bg-black mb-4"></div>
             <button @click="scrollToFeatures" class="uppercase text-xs font-bold tracking-widest hover:pl-4 transition-all">
                {{ t.hero.scroll }}
             </button>
          </div>

          <div class="relative z-30 mt-16 md:mt-0 md:absolute md:bottom-20 md:right-12 md:text-right max-w-lg opacity-0 translate-y-6 transition-all duration-1000 delay-[1600ms]" :class="{ '!opacity-100 !translate-y-0': isRevealed }">
             <p class="text-sm font-mono leading-relaxed whitespace-pre-line text-gray-600">
                {{ t.hero.sub }}
             </p>
          </div>

       </div>
    </header>

    <!-- === HORIZONTAL SCROLL SECTION === -->
    <!-- Height increased to 1200vh for stickier feel -->
    <div ref="stickySection" class="relative h-[1200vh] bg-black">
       <div class="sticky top-0 h-screen w-screen overflow-hidden flex items-center">
          
          <!-- THE TRAVELER: Persistent Morphing Element -->
          <div class="absolute pointer-events-none z-50 will-change-transform transition-colors duration-300"
               :style="{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${smoothMouseX * 40}px), calc(-50% + ${smoothMouseY * 40}px))`,
                  width: slideProgress.raw < 1.5 ? '60px' : (slideProgress.raw < 2.5 ? '120px' : '80px'),
                  height: slideProgress.raw < 1.5 ? '60px' : (slideProgress.raw < 2.5 ? '120px' : '80px'),
               }">
               
               <!-- S1: Soft Blob -->
               <div class="absolute inset-0 bg-slate-400 rounded-full blur-xl transition-all duration-700"
                    :style="{ opacity: slideProgress.raw < 0.8 ? 0.4 : 0, transform: `scale(${slideProgress.raw < 0.8 ? 1 : 0.5})` }"></div>

               <!-- S2: White Ring (Privacy) -->
               <div class="absolute inset-0 border-[3px] border-white rounded-full transition-all duration-500 ease-out"
                    :style="{ 
                        opacity: slideProgress.raw > 0.5 && slideProgress.raw < 1.8 ? 1 : 0, 
                        transform: `scale(${slideProgress.raw > 0.5 && slideProgress.raw < 1.8 ? 1.5 : 0.8}) rotate(${slideProgress.raw * 180}deg)`,
                        boxShadow: '0 0 30px rgba(255,255,255,0.3)' 
                    }"></div>

               <!-- S3: Gradient Orb (Journal) -->
               <div class="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-rose-400 rounded-full blur-[30px] transition-all duration-700"
                    :style="{ opacity: slideProgress.raw > 1.5 && slideProgress.raw < 2.5 ? 0.6 : 0, transform: `scale(${slideProgress.raw > 1.5 && slideProgress.raw < 2.5 ? 1.5 : 0.5})` }"></div>

               <!-- S4: Tech Square (Sync) -->
               <div class="absolute inset-0 border-2 border-indigo-500 bg-indigo-500/10 transition-all duration-500"
                    :style="{ 
                        opacity: slideProgress.raw > 2.2 ? 1 : 0, 
                        transform: `rotate(${45 + (slideProgress.raw * 45)}deg) scale(${slideProgress.raw > 2.2 ? 1 : 0.5})`,
                        borderRadius: slideProgress.raw > 2.2 ? '12px' : '50%'
                    }">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               </div>
          </div>

          <!-- Track -->
          <div ref="horizontalTrack" class="flex h-full w-full will-change-transform">
             
             <!-- SLIDE 1: Structure (Glass/Blur) -->
             <div 
               class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-[#F5F5F7]"
               :style="{
                  transform: `scale(${0.95 + (slideProgress.s1 * 0.05)})`,
                  opacity: slideProgress.s1
               }"
             >
                <!-- Dynamic Background -->
                <div class="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-[#E0E0E0] rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
                <div class="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#D6D6D6] rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
                
                <!-- Mega Marquee (New) -->
                <div class="absolute top-1/2 left-0 w-full -translate-y-1/2 overflow-hidden pointer-events-none opacity-[0.05] select-none z-0">
                   <div class="whitespace-nowrap text-[25vw] font-black leading-none animate-marquee" 
                        :style="{ transform: `translateX(${(slideProgress.raw - 0) * -300}px)` }"
                        style="-webkit-text-stroke: 4px black; color: transparent;">
                      COGNITIVE RESTRUCTURING • COGNITIVE RESTRUCTURING •
                   </div>
                </div>

                <!-- Background Number -->
                <div class="absolute top-12 left-4 md:top-24 md:left-24 text-[12rem] md:text-[16rem] font-black tracking-[-0.06em] leading-none text-black/5 select-none z-0 pointer-events-none"
                     :style="{ transform: `translateY(${(slideProgress.raw - 0) * 150}px)` }"
                >01</div>

                <div class="relative z-10 w-full max-w-[90vw] grid md:grid-cols-12 gap-8 items-end">
                   <div class="md:col-span-8 relative">
                      <div class="mb-4">
                         <h2 class="text-6xl md:text-[8vw] font-black tracking-[-0.05em] leading-[0.9] text-black relative z-10 will-change-transform" 
                             :style="{ transform: `translateY(${(1 - slideProgress.s1) * 40}px)` }">
                            {{ t.features.c1_title }}
                         </h2>
                      </div>
                      <div class="h-[1px] w-0 bg-black mb-8 transition-all duration-1000 delay-300" :class="{ 'w-32': slideProgress.s1 > 0.5 }"></div>
                      <p class="text-xl md:text-2xl text-gray-500 max-w-xl font-medium tracking-tight leading-relaxed transition-all duration-700"
                         :style="{ opacity: slideProgress.s1, transform: `translateY(${(1 - slideProgress.s1) * 20}px)` }">
                         {{ t.features.c1_desc }}
                      </p>
                   </div>
                   
                   <!-- Interactive Glass Card -->
                   <div class="md:col-span-4 h-[52vh] w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex items-center justify-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-700 animate-float-slow"
                        :style="{ 
                            transform: `perspective(1000px) 
                                        rotateY(${(slideProgress.raw * 25) + (smoothMouseX * 15)}deg) 
                                        rotateX(${(slideProgress.raw * -15) + (smoothMouseY * -15)}deg) 
                                        translateZ(50px)`,
                            boxShadow: `${(slideProgress.raw * -20) + (smoothMouseX * -30)}px 40px 80px -20px rgba(0,0,0,0.2)`
                        }"
                   >
                      <div class="absolute inset-0 bg-gradient-to-tr from-white/80 via-transparent to-transparent opacity-50"></div>
                      <!-- Scanning Light Effect -->
                      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[50%] skew-x-12 animate-scan"
                           style="mix-blend-mode: overlay;"></div>
                      
                      <div class="relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center transform transition-transform duration-500 hover:scale-105">
                         <div class="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-lg">
                            <IconBrain class="h-10 w-10 text-indigo-600" />
                         </div>
                         <div class="grid w-52 grid-cols-4 gap-2">
                            <div class="h-2 rounded-full bg-slate-800/80"></div>
                            <div class="h-2 rounded-full bg-slate-800/40"></div>
                            <div class="h-2 rounded-full bg-slate-800/60"></div>
                            <div class="h-2 rounded-full bg-slate-800/30"></div>
                            <div class="h-2 rounded-full bg-slate-800/40"></div>
                            <div class="h-2 rounded-full bg-slate-800/70"></div>
                            <div class="h-2 rounded-full bg-slate-800/30"></div>
                            <div class="h-2 rounded-full bg-slate-800/60"></div>
                         </div>
                         <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white/50 px-4 py-2 rounded-full border border-white/50">
                            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{{ t.features.c1_meta }}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- SLIDE 2: Privacy (Dark/Cyber -> Expansion) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-black text-white">
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                <!-- Radar Grid (Visibility Boosted) -->
                <div class="absolute inset-[-50%] border-[1px] border-white/20 rounded-full animate-spin-very-slow opacity-60" 
                     :style="{ transform: `rotate(${(slideProgress.raw - 1) * 90}deg)` }"
                     style="background: repeating-radial-gradient(transparent, transparent 99px, rgba(255,255,255,0.15) 100px);">
                </div>
                <div class="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,255,255,0.1)_360deg)] animate-spin-very-slow opacity-50"></div>

                <!-- Background Number -->
                <div 
                  class="absolute top-12 left-4 md:top-24 md:left-24 text-[12rem] md:text-[16rem] font-black tracking-[-0.06em] leading-none select-none z-1 pointer-events-none transition-colors duration-500"
                  :class="slideProgress.s2 > 0.8 ? 'text-black/10' : 'text-white/10'"
                  :style="{ transform: `translateY(${(slideProgress.raw - 1) * 100}px)` }"
                >02</div>

                <!-- THE EXPANDING CIRCLE -->
                <!-- Adjusted to ensure text remains visible -->
                <div 
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] border-[1px] border-white rounded-full flex items-center justify-center transition-transform duration-75 will-change-transform z-0"
                  :style="{
                    transform: `translate(-50%, -50%) scale(${Math.max(1, (slideProgress.raw - 0.8) * 80)})`,
                    borderWidth: `${Math.max(1, 100 * (1.2 - slideProgress.raw))}px`,
                    opacity: 1, /* Always keep opacity to 1 so background transition works */
                    backgroundColor: slideProgress.s2 > 0.5 ? '#F8FAFC' : 'transparent',
                    borderColor: slideProgress.s2 > 0.5 ? 'transparent' : '#FFFFFF'
                  }"
                >
                </div>

                <div class="relative z-10 w-full max-w-[90vw] text-center mix-blend-difference">
                   <!-- Content Reveal: Text scales UP and fades IN as circle expands -->
                   <div :style="{ 
                       opacity: Math.min(1, Math.max(0, (slideProgress.s2 - 0.2) * 2.5)),
                       transform: `scale(${0.9 + (Math.min(1, Math.max(0, (slideProgress.s2 - 0.2) * 2.5)) * 0.1)}) 
                                   translate(${smoothMouseX * 30}px, ${smoothMouseY * 30}px)` 
                   }">
                      <div class="relative inline-flex items-center gap-3 px-4 py-1 border border-white/30 rounded-full mb-12 overflow-hidden">
                         <!-- Rotating Ring Effect -->
                         <div class="absolute inset-[-4px] border border-dashed border-white/20 rounded-full animate-spin-very-slow"></div>
                         <!-- Scan Beam (New) -->
                         <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-[40%] w-full animate-scan-vertical"></div>
                         
                         <IconShield class="w-4 h-4 text-emerald-300/90 animate-pulse relative z-10" />
                         <span class="text-xs font-mono tracking-widest uppercase relative z-10">{{ t.features.c2_badge }}</span>
                      </div>
                      <div class="relative inline-block">
                         <h2 class="relative z-10 text-[12vw] leading-[0.8] font-black tracking-[-0.08em] mb-8"
                             :style="{ transform: `translateY(${(1 - Math.min(1, slideProgress.s2 * 1.5)) * 40}px)` }">
                            {{ t.features.c2_title }}
                         </h2>
                      </div>
                      <p class="text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-tight relative z-10"
                         :style="{ transform: `translateY(${(1 - slideProgress.s2) * 20}px)` }">
                         {{ t.features.c2_desc }}
                      </p>
                   </div>
                </div>
             </div>

             <!-- SLIDE 3: Journal (Iridescent -> Revealed by White Circle) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-white"
                  :style="{
                    perspective: '1500px'
                  }"
             >
                <div class="absolute inset-0 bg-gradient-to-tr from-rose-50 via-slate-50 to-indigo-50 opacity-80"></div>
                
                <!-- Thought Ripples (Visibility Boosted) -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] border border-indigo-500/30 rounded-full animate-ripple"
                     :style="{ animationDuration: `${5 - (slideProgress.s3 * 2)}s` }"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] border border-indigo-500/20 rounded-full animate-ripple" style="animation-delay: 1.5s;"
                     :style="{ animationDuration: `${5 - (slideProgress.s3 * 2)}s` }"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] border border-indigo-500/10 rounded-full animate-ripple" style="animation-delay: 3s;"
                     :style="{ animationDuration: `${5 - (slideProgress.s3 * 2)}s` }"></div>

                <!-- Floating Particles (Enhanced Parallax) -->
                <div class="absolute top-1/4 right-1/4 w-32 h-32 bg-indigo-300/40 rounded-full blur-[40px] animate-float-slow mix-blend-multiply" style="animation-delay: -2s;"
                     :style="{ transform: `translateY(${(slideProgress.raw - 2) * -150}px) scale(${1 + (slideProgress.s3 * 0.5)})` }"></div>
                <div class="absolute bottom-1/3 left-1/3 w-40 h-40 bg-rose-300/40 rounded-full blur-[40px] animate-float-slow mix-blend-multiply" style="animation-delay: -5s;"
                     :style="{ transform: `translateY(${(slideProgress.raw - 2) * 150}px) scale(${1 + (slideProgress.s3 * 0.5)})` }"></div>

                <!-- Background Number (Added Pulse) -->
                <div class="absolute top-12 left-4 md:top-24 md:left-24 text-[12rem] md:text-[16rem] font-black tracking-[-0.06em] leading-none text-black/5 select-none z-0 pointer-events-none animate-pulse-slow"
                     :style="{ transform: `translateY(${(slideProgress.raw - 2) * 100}px)` }"
                >03</div>

                <div class="relative z-10 w-full max-w-[85vw] grid md:grid-cols-2 gap-24 items-center transition-transform duration-75 will-change-transform"
                     :style="{
                        transform: `rotateY(${(2 - slideProgress.raw) * 30}deg) scale(${Math.max(0.9, slideProgress.s3)})`,
                        opacity: slideProgress.s3
                     }"
                >
                   <div class="space-y-10">
                       <div class="relative overflow-hidden">
                           <h2 class="relative z-10 text-[8vw] xl:text-[7rem] leading-tight font-black tracking-[-0.06em] text-black whitespace-nowrap"
                               :style="{ transform: `translateY(${(1 - slideProgress.s3) * 100}%)` }">
                             {{ t.features.c3_title }}
                           </h2>
                       </div>
                       <p class="text-3xl text-gray-500 font-medium tracking-tight leading-tight max-w-lg relative z-10 transition-all duration-700"
                          :style="{ opacity: slideProgress.s3, transform: `translateX(${(1 - slideProgress.s3) * -50}px)` }">
                         {{ t.features.c3_desc }}
                       </p>
                       <div class="flex gap-4 pt-8 relative z-10">
                          <div class="w-20 h-20 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-500 cursor-pointer group shadow-lg hover:scale-110">
                             <svg class="w-8 h-8 group-hover:rotate-45 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </div>
                       </div>
                   </div>
                   
                   <div class="relative perspective-1000 h-[600px] flex items-center justify-center">
                      <!-- 3D Floating Cards (Multi-Layer) -->
                      <!-- Back Layer -->
                      <div class="absolute w-[80%] h-[70%] bg-white rounded-[2rem] shadow-2xl border border-gray-100 opacity-60 scale-90 -z-10 animate-float-slow" 
                           style="animation-delay: -2s;"
                           :style="{ transform: `translateZ(-100px) 
                                                 translateY(${(slideProgress.raw - 2) * -30}px) 
                                                 rotateZ(-5deg)
                                                 translate(${smoothMouseX * -20}px, ${smoothMouseY * -20}px)` }"></div>
                      
                      <!-- Main Card -->
                      <div class="relative bg-white/90 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 w-full animate-float-slow will-change-transform group cursor-pointer"
                           :style="{ 
                               transform: `rotateY(${((slideProgress.raw - 2) * -20) + (smoothMouseX * 10)}deg) 
                                           rotateX(${((slideProgress.raw - 2) * 15) + (smoothMouseY * -10)}deg) 
                                           translateZ(50px)`,
                               boxShadow: `${((slideProgress.raw - 2) * 40) + (smoothMouseX * -20)}px 60px 120px -30px rgba(0,0,0,0.15)`
                           }">
                            
                            <!-- Shimmer Overlay -->
                            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                            <div class="flex items-center justify-between mb-12">
                               <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                  <IconReflection class="w-8 h-8" />
                               </div>
                               <div class="w-24 h-3 bg-gray-100 rounded-full"></div>
                            </div>
                            <div class="space-y-6">
                               <div class="h-4 w-full bg-gray-100 rounded-full"></div>
                               <div class="h-4 w-5/6 bg-gray-100 rounded-full"></div>
                               <div class="h-4 w-4/6 bg-gray-100 rounded-full"></div>
                               <div class="h-4 w-full bg-gray-50 rounded-full"></div>
                            </div>
                            <div class="mt-12 flex gap-3">
                               <div class="h-10 w-24 bg-indigo-50 rounded-xl animate-pulse"></div>
                               <div class="h-10 w-24 bg-rose-50 rounded-xl animate-pulse" style="animation-delay: 0.5s"></div>
                            </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- SLIDE 4: Sync (Structured/Grid) -->
             <div class="w-screen h-screen flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-[#F8FAFC] text-slate-900">
                <!-- 3D Perspective Grid Floor (Light Theme) -->
                <div class="absolute inset-x-[-50%] bottom-[-50%] h-[150%] origin-bottom will-change-transform" 
                     :style="{
                        backgroundImage: `linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                        transform: `perspective(1000px) 
                                    rotateX(${60 + (smoothMouseY * 2)}deg) 
                                    rotateZ(${smoothMouseX * 1}deg)
                                    translateY(${(1 - slideProgress.s4) * 200}px) 
                                    translateZ(-200px)`,
                        opacity: 0.3
                     }">
                     <div class="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent"></div>
                </div>
                
                <!-- High-Intensity Beam Overlay (Subtle Indigo) -->
                <div class="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_49px,rgba(99,102,241,0.2)_50px)] animate-scan" style="background-size: 200% 100%; animation-duration: 15s;"></div>

                <!-- Vertical Data Beams (Subtle) -->
                <div class="absolute left-[20%] top-[-20%] h-[140%] w-[1px] bg-gradient-to-b from-transparent via-indigo-400 to-transparent animate-scan-vertical" 
                     style="animation-duration: 4s; opacity: 0.4;"></div>
                <div class="absolute right-[20%] top-[-20%] h-[140%] w-[1px] bg-gradient-to-b from-transparent via-slate-400 to-transparent animate-scan-vertical" 
                     style="animation-duration: 5s; animation-delay: 2s; opacity: 0.4;"></div>
                
                <!-- Connecting Horizontal Beam -->
                <div class="absolute top-[50%] left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan-fast"
                     :style="{ animationDuration: `${4 - (slideProgress.s4 * 2)}s` }"></div>

                <!-- Background Number -->
                <div class="absolute top-12 left-4 md:top-24 md:left-24 text-[12rem] md:text-[16rem] font-black tracking-[-0.06em] leading-none text-slate-200/50 select-none z-0 pointer-events-none"
                     :style="{ transform: `translateY(${(slideProgress.raw - 3) * 100}px)` }"
                >04</div>

                <div class="relative z-10 w-full h-full max-w-[90vw] flex flex-col items-center justify-center text-center pb-24 md:pb-32"
                     :style="{
                        opacity: slideProgress.s4,
                        transform: `scale(${Math.min(1, 0.98 + (slideProgress.s4 * 0.02))})`
                     }"
                >
                   <div class="flex-1 flex flex-col justify-center w-full">
                       <div class="mb-8 md:mb-12 grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-24 relative max-w-4xl mx-auto">
                          <!-- Connection Line -->
                          <div class="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-slate-200 hidden sm:block">
                              <div class="absolute top-1/2 left-0 w-full h-[2px] bg-indigo-400 blur-[1px] -translate-y-1/2 animate-scan-fast" style="animation-duration: 3s;"></div>
                          </div>

                          <div class="group relative z-10">
                             <div class="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                             <div class="relative z-10 w-24 h-24 md:w-32 md:h-32 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] flex items-center justify-center text-indigo-600 group-hover:-translate-y-2 transition-transform duration-500 group-hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)]">
                                <IconDevices class="w-10 h-10 md:w-14 md:h-14" />
                             </div>
                             <div class="relative z-10 mt-4 md:mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                {{ t.features.c4_tag1 }}
                             </div>
                          </div>
                          
                          <div class="group relative z-10 mt-8 sm:mt-0">
                             <div class="absolute inset-0 bg-slate-400 rounded-[2.5rem] blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow" style="animation-delay: 1s;"></div>
                             <div class="relative z-10 w-24 h-24 md:w-32 md:h-32 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-700 group-hover:-translate-y-2 transition-transform duration-500 group-hover:shadow-[0_20px_40px_-10px_rgba(71,85,105,0.15)]">
                                <IconClock class="w-10 h-10 md:w-14 md:h-14" />
                             </div>
                             <div class="relative z-10 mt-4 md:mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                {{ t.features.c4_tag2 }}
                             </div>
                          </div>
                       </div>
                       
                       <h2 class="relative z-10 text-[8vw] md:text-[6rem] leading-[0.9] font-black tracking-[-0.08em] text-slate-900 mb-6 md:mb-10 uppercase">
                          {{ t.features.c4_title }}
                       </h2>
                       
                       <div class="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 relative z-10 shadow-sm max-w-xl mx-auto transform transition-transform duration-300"
                            :style="{ transform: `translate(${smoothMouseX * 5}px, ${smoothMouseY * 5}px)` }">
                          <p class="text-base md:text-xl text-slate-600 font-medium tracking-tight leading-relaxed">
                             {{ t.features.c4_desc }}
                          </p>
                       </div>
                   </div>
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

    <!-- === CALL TO ACTION & FOOTER === -->
    <section ref="ctaSection" class="min-h-screen flex flex-col relative bg-black text-[#EAEAEA]">
       <div class="absolute inset-0 opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" class="w-full h-full object-cover grayscale" alt="Noise">
       </div>
       
       <!-- Main Content -->
       <div class="relative z-10 flex-grow flex flex-col items-center justify-center px-6 md:px-12 text-center py-32">
          <div class="max-w-4xl mx-auto space-y-12 transition-all duration-1000 transform" 
               :class="ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'">
             <h2 class="text-5xl md:text-9xl font-black tracking-tighter mix-blend-difference">
                {{ t.cta.title }}
             </h2>
             <p class="text-xl md:text-3xl text-gray-400 font-light leading-relaxed whitespace-pre-wrap transition-all duration-1000 delay-200"
                :class="ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'">
                {{ t.cta.sub }}
             </p>
             <div class="transition-all duration-1000 delay-300"
                  :class="ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'">
                <button 
                   @click="router.push('/register')" 
                   class="px-16 py-6 bg-white text-black rounded-full font-bold text-xl tracking-widest uppercase shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)] hover:bg-indigo-500 hover:text-white hover:-translate-y-1 hover:shadow-[0_25px_70px_-35px_rgba(79,70,229,0.6)] transition-all duration-300 hover:scale-105"
                >
                   {{ t.cta.btn }}
                </button>
             </div>
          </div>
       </div>

       <!-- Integrated Footer -->
       <footer class="relative z-10 w-full px-6 py-12 flex flex-col md:flex-row justify-between items-end text-white/60 text-xs font-mono uppercase tracking-widest border-t border-white/10 transition-all duration-1000 delay-500"
               :class="ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
          <div class="mb-8 md:mb-0 whitespace-pre-line leading-relaxed hover:text-white transition-colors duration-300">
             {{ t.footer.copy }}
          </div>
          <div class="flex flex-col md:flex-row gap-8">
             <router-link to="/privacy" class="hover:text-indigo-400 transition-colors duration-300 hover:-translate-y-1 inline-block">{{ t.footer.terms }}</router-link>
             <router-link to="/terms" class="hover:text-indigo-400 transition-colors duration-300 hover:-translate-y-1 inline-block">{{ t.footer.privacy }}</router-link>
             <a href="mailto:hello@cbtsaas.com" class="hover:text-indigo-400 transition-colors duration-300 hover:-translate-y-1 inline-block">{{ t.footer.contact }}</a>
          </div>
       </footer>
    </section>

  </div>
</template>

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

@keyframes scan {
  0% { transform: translateX(-120%); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(120%); opacity: 0; }
}
.animate-scan { animation: scan 2.8s ease-in-out infinite; }

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float-slow { animation: float-slow 8s ease-in-out infinite; }

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 20s linear infinite; }

@keyframes scan-vertical {
  0%, 100% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan-vertical { animation: scan-vertical 4s ease-in-out infinite; }

@keyframes scan-fast {
  0% { left: -100%; opacity: 0; }
  50% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
.animate-scan-fast { animation: scan-fast 3s linear infinite; }

@keyframes spin-very-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-very-slow { animation: spin-very-slow 20s linear infinite; }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

@keyframes grid-pan {
  0% { background-position: 0px 0px; }
  100% { background-position: 100px 100px; }
}
.animate-grid-pan { animation: grid-pan 10s linear infinite; }

@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  20% { opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
.animate-ripple { animation: ripple 6s linear infinite; }



@media (prefers-reduced-motion: reduce) {
  .animate-blob,
  .animate-scan,
  .animate-float-slow,
  .animate-spin-slow,
  .animate-spin-very-slow,
  .animate-pulse-slow,
  .animate-grid-pan,
  .animate-ripple,
  .animate-rain-1,
  .animate-rain-2 {
    animation: none !important;
  }
}
</style>