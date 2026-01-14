<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">隱私政策</h1>
        <p class="mt-2 text-gray-500 text-lg">我們重視並保護您的個人資訊。</p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50/50">
        <div class="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              1. 資訊收集
            </h2>
            <p>我們可能收集以下類型的個人資訊：</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>帳戶資訊：電子郵件地址、姓名（選填）</li>
              <li>使用數據：應用程式使用統計、活動記錄</li>
              <li>裝置資訊：裝置型號、作業系統版本、瀏覽器類型</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              2. 資訊使用
            </h2>
            <p>我們使用收集的資訊來：</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>提供、維護和改進服務</li>
              <li>管理帳戶註冊和身分驗證</li>
              <li>發送技術通知、更新和支援訊息</li>
              <li>分析使用趨勢以改善用戶體驗</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              3. 資訊分享
            </h2>
            <p>我們不會出售、租賃或以其他方式向第三方提供您的個人資訊，除非：</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>獲得您的明確同意</li>
              <li>遵守法律要求</li>
              <li>保護我們的權利或財產</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              4. 資訊安全
            </h2>
            <p>我們採取適當的技術和管理措施來保護您的個人資訊免於未經授權的存取、修改或洩露。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              5. Cookie 與追蹤技術
            </h2>
            <p>我們使用 Cookie 和類似技術來：</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>記住您的登入狀態</li>
              <li>分析網站流量和使用模式</li>
              <li>提供個人化體驗</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              6. 用戶權利
            </h2>
            <p>您有權：</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>存取、更新或刪除您的個人資訊</li>
              <li>限制或反對資訊處理活動</li>
              <li>要求資訊轉移</li>
              <li>撤回同意</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              7. 資料保存
            </h2>
            <p>我們僅在必要時保留您的個人資訊，通常不超過帳戶活躍期間。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              8. 兒童隱私
            </h2>
            <p>本服務不針對 13 歲以下兒童設計。若發現收集了兒童資料，我們將採取措施刪除該資訊。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              9. 政策更新
            </h2>
            <p>我們可能會不時更新此隱私政策。重大變更時，將透過應用程式或電子郵件通知您。</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              10. 聯絡我們
            </h2>
            <p>如有隱私政策相關問題，請透過應用程式中的聯絡功能與我們聯繫。</p>
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