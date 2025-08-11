<template>
    <div class="p-6 min-h-screen flex flex-col justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-2">CBT 小幫手</h1>
        <p class="text-gray-600">
          選任務 → 設時間 → 傳到日曆/Email/LINE → 完成後記錄。
        </p>
      </div>
  
      <button
        class="w-full py-3 rounded bg-black text-white"
        @click="$router.push('/tasks')"
      >
        開始
      </button>
    </div>
  </template>
  
  <script setup>
  // 這裡暫時不需要任何腳本
  </script>
  