<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow-lg rounded-lg">
        <div class="px-6 py-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">服務條款</h1>

          <div class="prose prose-gray max-w-none">
            <h2>1. 服務說明</h2>
            <p>CBT 小幫手是一個基於行為活化（Behavioral Activation）和認知行為療法（CBT）的心理健康支持應用程式，旨在幫助用戶管理情緒和改善心理健康。</p>

            <h2>2. 用戶責任</h2>
            <p>使用者同意在使用本服務時遵守相關法律法規，並對自己的行為負責。本服務僅供參考，不得用作醫療診斷或治療。</p>

            <h2>3. 帳戶管理</h2>
            <p>使用者應對帳戶安全負責，並及時通知我們任何未經授權的使用行為。</p>

            <h2>4. 內容政策</h2>
            <p>本應用程式的所有內容僅供教育和資訊目的，不構成醫療建議。</p>

            <h2>5. 服務終止</h2>
            <p>我們保留隨時終止或暫停服務的權利，恕不另行通知。</p>

            <h2>6. 免責聲明</h2>
            <p>本服務按「現狀」提供，不提供任何明示或默示的保證。</p>

            <h2>7. 法律適用</h2>
            <p>本服務條款受中華民國法律管轄。</p>

            <h2>8. 聯絡資訊</h2>
            <p>如有問題，請透過應用程式中的聯絡功能與我們聯繫。</p>
          </div>

          <div class="mt-8 text-center text-sm text-gray-500">
            <p>最後更新日期：{{ new Date().toLocaleDateString('zh-TW') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 此頁面為靜態內容，無需特殊邏輯
</script>

<style scoped>
.prose {
  color: #374151;
  max-width: none;
}

.prose h2 {
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h3 {
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}
</style>
