<template>
  <div class="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-black selection:text-white relative overflow-hidden">
    <!-- Global Noise Texture -->
    <div class="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply" 
         style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');">
    </div>

    <!-- Navigation Back -->
    <nav class="fixed top-0 inset-x-0 z-40 h-20 bg-[#FDFDFD]/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-6 md:px-12">
       <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
        <div class="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white font-bold text-sm tracking-tighter group-hover:bg-indigo-600 transition-colors duration-500">
            C
        </div>
        <span class="font-bold text-xl tracking-tighter text-black group-hover:text-indigo-600 transition-colors duration-500">CBT SaaS</span>
      </div>
      <button @click="router.push('/')" class="text-sm font-semibold tracking-tight hover:text-indigo-600 transition-colors">BACK TO HOME</button>
    </nav>

    <div class="max-w-4xl mx-auto pt-40 pb-24 px-6 md:px-12">
      <div class="mb-16">
        <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-white shadow-sm mb-6">
           <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
           <span class="text-[10px] font-bold tracking-widest uppercase text-slate-500">Legal Document</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tighter mb-6">服務條款</h1>
        <p class="text-xl text-slate-500 leading-relaxed max-w-2xl">
          使用本服務前，請仔細閱讀以下條款。這些條款規範了您使用 CBT SaaS 的權利與義務。
        </p>
      </div>

      <div class="prose prose-lg prose-slate max-w-none">
        <div class="space-y-12">
          
          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">01</span>
              服務說明
            </h2>
            <p class="text-slate-600 leading-relaxed">
              CBT SaaS 是一款基於認知行為療法（Cognitive Behavioral Therapy）原理的輔助工具，旨在幫助用戶識別、記錄並重塑思維模式。本服務包含數位日誌、情緒追蹤圖表及引導式練習功能。
            </p>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">02</span>
              醫療免責聲明
            </h2>
            <div class="bg-indigo-50 p-6 border border-indigo-100 rounded-xl">
              <p class="text-indigo-900 font-medium leading-relaxed">
                <strong>重要聲明：</strong> 本服務僅供自我探索與輔助使用，<strong>不具備任何醫療診斷或治療效力</strong>。若您面臨嚴重的心理困擾、緊急危機或自傷風險，請立即尋求專業醫療協助或撥打當地緊急救助電話。
              </p>
            </div>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">03</span>
              用戶責任
            </h2>
            <p class="text-slate-600 leading-relaxed">
              使用者同意：
            </p>
            <ul class="list-none pl-0 space-y-3 mt-4 text-slate-600">
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>提供真實、準確的帳戶註冊資訊。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>妥善保管帳戶密碼，不與他人共用帳戶。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>僅將本服務用於個人非商業用途，且不從事任何破壞系統安全的行為。</span>
              </li>
            </ul>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">04</span>
              智慧財產權
            </h2>
            <p class="text-slate-600 leading-relaxed">
              本服務所包含的所有內容（包括但不限於文字、圖表、介面設計、程式碼）均受智慧財產權法律保護。未經我們書面同意，不得複製、修改或轉載。
            </p>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">05</span>
              終止條款
            </h2>
            <p class="text-slate-600 leading-relaxed">
              若用戶違反本服務條款，我們保留在不事先通知的情況下，暫停或永久終止該用戶帳戶的權利。用戶亦可隨時停止使用本服務並刪除帳戶。
            </p>
          </section>

        </div>
      </div>
      
      <div class="mt-24 pt-12 border-t border-black/10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 font-mono">
        <p>Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        <p>CBT SaaS Inc. &copy; 2026</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>