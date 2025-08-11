<script setup>
import { onMounted, ref } from 'vue'
import { useAppStore } from '../stores/app'
import { stats } from '../services/mockApi'
const store = useAppStore()
const s = ref({ planned:0, completed:0, avg_relief:0 })
onMounted(async ()=> { s.value = await stats(store.userId) })
</script>
<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">我的儀表板</h2>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div class="border rounded p-3"><div class="text-2xl font-bold">{{ s.planned }}</div><div class="text-xs text-gray-500">計畫</div></div>
      <div class="border rounded p-3"><div class="text-2xl font-bold">{{ s.completed }}</div><div class="text-xs text-gray-500">完成</div></div>
      <div class="border rounded p-3"><div class="text-2xl font-bold">{{ s.avg_relief }}</div><div class="text-xs text-gray-500">平均焦慮↓</div></div>
    </div>
    <button class="w-full py-3 rounded bg-black text-white" @click="$router.push('/tasks')">再安排一個</button>
  </div>
</template>
