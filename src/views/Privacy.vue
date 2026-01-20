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
        <h1 class="text-4xl md:text-6xl font-bold tracking-tighter mb-6">隱私權政策</h1>
        <p class="text-xl text-slate-500 leading-relaxed max-w-2xl">
          我們重視並保護您的個人資訊。本政策旨在透明地說明我們如何收集、使用與保護您的數據。
        </p>
      </div>

      <div class="prose prose-lg prose-slate max-w-none">
        <div class="space-y-12">
          
          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">01</span>
              資訊收集
            </h2>
            <p class="text-slate-600 leading-relaxed">
              為了提供最佳的 CBT 練習體驗，我們可能收集以下類型的個人資訊：
            </p>
            <ul class="list-none pl-0 space-y-3 mt-4 text-slate-600">
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span><strong>帳戶資訊：</strong> 當您註冊時提供的電子郵件地址與姓名。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span><strong>使用數據：</strong> 應用程式內的操作記錄、練習完成度與活動統計。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span><strong>裝置資訊：</strong> 裝置型號、作業系統版本等技術數據，用於優化系統相容性。</span>
              </li>
            </ul>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">02</span>
              資訊使用
            </h2>
            <p class="text-slate-600 leading-relaxed">
              我們僅在必要範圍內使用您的資訊：
            </p>
            <div class="grid md:grid-cols-2 gap-6 mt-6">
               <div class="bg-white p-6 border border-black/5 rounded-xl">
                  <h3 class="font-bold mb-2">服務提供</h3>
                  <p class="text-sm text-slate-500">維護系統運作、管理帳戶身分驗證與數據同步。</p>
               </div>
               <div class="bg-white p-6 border border-black/5 rounded-xl">
                  <h3 class="font-bold mb-2">體驗改善</h3>
                  <p class="text-sm text-slate-500">分析匿名化的使用趨勢，以持續優化介面與功能。</p>
               </div>
            </div>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">03</span>
              資訊安全
            </h2>
            <p class="text-slate-600 leading-relaxed">
              我們採用業界標準的加密技術（SSL/TLS）傳輸您的數據。資料庫採用端對端加密保護，並實施嚴格的存取控制，確保只有經授權的系統能處理您的請求。
            </p>
          </section>

          <hr class="border-black/5" />

          <section>
            <h2 class="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <span class="text-indigo-600 text-sm font-mono translate-y-0.5">04</span>
              用戶權利
            </h2>
            <p class="text-slate-600 leading-relaxed mb-4">
              您對個人數據擁有完全的掌控權：
            </p>
            <ul class="list-none pl-0 space-y-3 text-slate-600">
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>隨時存取或匯出您的個人練習記錄。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>要求更正不準確的個人資料。</span>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0"></span>
                <span>隨時刪除帳戶，這將永久移除所有相關數據。</span>
              </li>
            </ul>
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