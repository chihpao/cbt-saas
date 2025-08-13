<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()

function nextStep(){
  if (!store.scheduledTime) return
  localStorage.setItem('scheduled_time', store.scheduledTime)
  router.push('/notify')
}
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-semibold">選擇時間</h2>
    <div class="p-3 border rounded bg-white">
      <div class="mb-2">任務：<b>{{ store.selectedTask?.title }}</b></div>
      <input type="datetime-local" class="border rounded px-3 py-2 w-full"
             v-model="store.scheduledTime"
             :min="new Date().toISOString().slice(0,16)" />
    </div>
    <button class="w-full py-3 rounded bg-black text-white" @click="nextStep">下一步</button>
  </div>
</template>
