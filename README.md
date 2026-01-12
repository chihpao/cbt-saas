#  CBT 小幫手

一個基於行為活化（Behavioral Activation）和認知行為療法（CBT）的心理健康支持應用程式，幫助用戶透過小行動改善情緒健康。

##  功能特色

###  核心功能
- **行為活化任務** - 基於 CBT 原理的任務挑選系統
- **智能排程** - 靈活的任務時間安排
- **進度追蹤** - 完成任務後的反思與記錄
- **通知提醒** - 及時的任務提醒功能
- **個人儀表板** - 追蹤個人進度和統計數據

###  身份驗證
- Google 帳號快速登入
- 安全的用戶註冊與登入系統
- 受保護的個人資料

###  用戶體驗
- 響應式設計，支援手機、平板、桌面
- 現代化 UI 設計
- 直觀的操作流程

##  技術架構

### 前端技術
- **Vue 3** - 使用 Composition API 和 `<script setup>`
- **Vite** - 快速的建構工具和開發伺服器
- **Vue Router** - 客戶端路由管理
- **Tailwind CSS** - 實用優先的 CSS 框架
- **TypeScript** - 類型安全的開發體驗

### 後端服務
- **Supabase** - 開源的後端即服務（BaaS）
  - 用戶身份驗證
  - 即時資料庫
  - 檔案儲存
  - API 服務

### 開發工具
- **ESLint** - 程式碼品質檢查
- **Prettier** - 程式碼格式化
- **Vitest** - 單元測試框架

##  快速開始

### 環境需求
- Node.js 18+
- npm 或 yarn
- Git

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/chihpao/cbt-saas.git
   cd cbt-saas
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境配置**
   ```bash
   # 複製環境變數模板
   cp .env.example .env
   ```

   編輯 `.env` 文件，填入你的 Supabase 配置：
   ```env
   VITE_SUPABASE_URL=你的_supabase_url
   VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **開啟瀏覽器**
   ```
   http://localhost:3000
   ```

##  專案結構

```
src/
├── components/          # 可重用的 Vue 組件
│   └── icons/          # SVG 圖標組件
├── views/              # 頁面組件
│   ├── auth/          # 身份驗證頁面（登入、註冊）
│   ├── Landing.vue    # 首頁
│   ├── TaskPicker.vue # 任務挑選
│   ├── Schedule.vue   # 排程管理
│   ├── Notify.vue     # 通知設定
│   ├── CompleteCBT.vue # CBT 完成反思
│   ├── Dashboard.vue  # 個人儀表板
│   ├── Terms.vue      # 服務條款
│   └── Privacy.vue    # 隱私政策
├── router/            # 路由配置
├── services/          # 服務層
│   ├── supaClient.js  # Supabase 客戶端
│   ├── supabaseApi.js # Supabase API 服務
│   └── mockApi.js     # 模擬 API（開發用）
├── assets/            # 靜態資源
└── styles/            # 全域樣式
```

##  可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建構生產版本 |
| `npm run preview` | 預覽生產版本 |
| `npm run lint` | 執行程式碼檢查 |

##  功能說明

### 行為活化流程
1. **任務挑選** - 選擇適合當下情緒狀態的活動
2. **時間安排** - 設定具體的執行時間
3. **執行任務** - 完成選定的活動
4. **反思記錄** - 記錄完成後的感受和收穫

### 任務類型
- 🏃‍♂️ 身體活動 - 運動、散步、伸展
- 📚 學習成長 - 閱讀、學習新技能
- 🎨 創意表達 - 繪畫、寫作、音樂
- 👥 社交互動 - 與朋友聚會、電話聯絡
- 🧘‍♀️ 放鬆休息 - 冥想、深呼吸、泡澡

##  特色功能

### 智能任務推薦
根據用戶的歷史記錄和當前狀態，推薦最適合的任務類型。

### 進度追蹤
視覺化的進度圖表，幫助用戶了解自己的改善趨勢。

### 提醒系統
靈活的通知設定，確保用戶不會遺漏重要任務。

### 資料安全
所有個人資料都經過加密處理，符合隱私保護標準。

##  貢獻指南

我們歡迎所有形式的貢獻！

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

##  授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

##  聯絡我們

- **專案維護者**: chihpao
- **電子郵件**: [chihpaoo@gmail.com](mailto:chihpaoo@gmail.com)
- **GitHub**: [https://github.com/chihpao/cbt-saas](https://github.com/chihpao/cbt-saas)

---

**讓我們一起透過小行動，創造大改變！** 🌱
