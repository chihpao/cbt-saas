<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)

onMounted(() => {
  const hasSeen = localStorage.getItem('has_seen_onboarding')
  if (!hasSeen) {
    show.value = true
  }
})

function close() {
  show.value = false
  localStorage.setItem('has_seen_onboarding', 'true')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="close"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        
        <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-3">歡迎來到您的情緒實驗室</h2>
        <p class="text-gray-500 mb-8 leading-relaxed">
          面對焦慮最好的方式，就是去做那件讓你害怕的事。我們會陪伴您記錄每一次的行動與感受。
        </p>

        <div class="space-y-4">
          <div class="flex items-start gap-4 text-left p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">挑選任務</h3>
              <p class="text-xs text-gray-500 mt-1">選擇一件讓您感到焦慮的小事。</p>
            </div>
          </div>

          <div class="flex items-start gap-4 text-left p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">執行並記錄</h3>
              <p class="text-xs text-gray-500 mt-1">完成後，寫下您的真實感受。</p>
            </div>
          </div>
        </div>

        <button 
          @click="close"
          class="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          開始我的旅程
        </button>
      </div>
    </div>
  </Transition>
</template>
