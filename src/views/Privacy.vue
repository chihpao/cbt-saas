<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow-lg rounded-lg">
        <div class="px-6 py-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">隱私政策</h1>

          <div class="prose prose-gray max-w-none">
            <h2>1. 資訊收集</h2>
            <p>我們可能收集以下類型的個人資訊：</p>
            <ul>
              <li>帳戶資訊：電子郵件地址、姓名（可選）</li>
              <li>使用資料：應用程式使用統計、功能使用記錄</li>
              <li>裝置資訊：裝置類型、作業系統版本、瀏覽器類型</li>
            </ul>

            <h2>2. 資訊使用</h2>
            <p>我們使用收集的資訊來：</p>
            <ul>
              <li>提供、維護和改進我們的服務</li>
              <li>處理帳戶註冊和身份驗證</li>
              <li>發送技術通知、更新和支援訊息</li>
              <li>分析使用趨勢以改進用戶體驗</li>
            </ul>

            <h2>3. 資訊分享</h2>
            <p>我們不會出售、租賃或以其他方式向第三方提供您的個人資訊，除非：</p>
            <ul>
              <li>獲得您的明確同意</li>
              <li>為了遵守法律要求</li>
              <li>保護我們的權利和財產</li>
            </ul>

            <h2>4. 資料安全</h2>
            <p>我們採取適當的技術和管理措施來保護您的個人資訊免於未經授權的存取、修改或披露。</p>

            <h2>5. Cookie 和追蹤技術</h2>
            <p>我們使用 Cookie 和類似技術來：</p>
            <ul>
              <li>記住您的登入狀態</li>
              <li>分析網站流量和使用模式</li>
              <li>提供個人化體驗</li>
            </ul>

            <h2>6. 用戶權利</h2>
            <p>您有權：</p>
            <ul>
              <li>存取、更正或刪除您的個人資訊</li>
              <li>拒絕某些資料處理活動</li>
              <li>要求資料可攜性</li>
              <li>撤回同意</li>
            </ul>

            <h2>7. 資料保留</h2>
            <p>我們僅在必要期間保留您的個人資訊，通常不會超過帳戶活躍期後的合理時間。</p>

            <h2>8. 兒童隱私</h2>
            <p>本服務不針對 13 歲以下兒童設計。如發現兒童使用本服務，我們將採取措施刪除相關資訊。</p>

            <h2>9. 政策更新</h2>
            <p>我們可能會不時更新本隱私政策。重大變更時，我們會透過應用程式或電子郵件通知您。</p>

            <h2>10. 聯絡我們</h2>
            <p>如對本隱私政策有疑問，請透過應用程式中的聯絡功能與我們聯繫。</p>
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
