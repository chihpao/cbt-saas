<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { completeWithCBT } from '../services/supabaseApi'

const store = useAppStore()
const router = useRouter()

const thought = ref('')
const before = ref(5)
const after  = ref(3)
const feeling = ref('')
const belief  = ref('')

async function submit(){
  if (!store.lastRecordId) return alert('沒有可提交的任務記錄')
  await completeWithCBT(store.userId, store.lastRecordId, {
    thought_before: thought.value,
    anxiety_before: Number(before.value),
    feeling_after:  feeling.value,
    anxiety_after:  Number(after.value),
    belief_adjustment: belief.value
  })
  alert('已記錄完成！')
  router.push('/dashboard')
}
</script>

<template>
  <div class="p-4 space-y-3">
    <h2 class="text-xl font-semibold">完成紀錄</h2>
    <textarea v-model="thought" class="w-full border rounded p-2" rows="3" placeholder="行前想法"/>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm">行前(0-10)</label>
        <input type="number" min="0" max="10" v-model="before" class="w-full border rounded px-2 py-1"/>
      </div>
      <div>
        <label class="text-sm">行後(0-10)</label>
        <input type="number" min="0" max="10" v-model="after"  class="w-full border rounded px-2 py-1"/>
      </div>
    </div>
    <textarea v-model="feeling" class="w-full border rounded p-2" rows="3" placeholder="行後感受"/>
    <textarea v-model="belief"  class="w-full border rounded p-2" rows="3" placeholder="信念修正"/>
    <button class="w-full py-3 rounded bg-black text-white" @click="submit">送出</button>
  </div>
</template>
