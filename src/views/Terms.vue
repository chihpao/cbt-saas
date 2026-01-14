<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">服務條款</h1>
        <p class="mt-2 text-gray-500 text-lg">使用本服務前，請仔細閱讀以下條款。</p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50/50">
        <div class="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              1. 服務說明
            </h2>
            <p>CBT 小幫手是一款基於行為活化（Behavioral Activation）與認知行為療法（CBT）的心理健康支持應用程式，旨在幫助用戶管理情緒並促進心理健康。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              2. 用戶責任
            </h2>
            <p>使用者同意在使用本服務時遵守所有適用法律，並對自己的行為負責。本服務僅供參考，不應用於取代專業醫療診斷或治療。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              3. 帳戶管理
            </h2>
            <p>使用者需對帳戶安全負責，並同意通知我們任何未經授權的使用行為。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              4. 內容所有權
            </h2>
            <p>本服務提供的內容（包含文字、圖片、程式碼）均受智慧財產權保護，未經授權不得轉載。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              5. 服務終止
            </h2>
            <p>我們保留隨時終止服務的權利，恕不另行通知。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              6. 免責聲明
            </h2>
            <p>本服務按「現狀」提供，不提供任何明示或默示的保證。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              7. 法律適用
            </h2>
            <p>本服務條款受中華民國法律管轄。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              8. 聯絡資訊
            </h2>
            <p>如有疑問，請透過應用程式中的聯絡功能與我們聯繫。</p>
          </section>
        </div>

        <div class="mt-12 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
          <p>最後更新日期：{{ new Date().toLocaleDateString('zh-TW') }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
</script>