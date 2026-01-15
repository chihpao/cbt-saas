<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const resources = [
  {
    name: '自殺防治安心專線',
    number: '1925',
    desc: '24小時免付費，專業心理諮詢',
    color: 'bg-rose-50 text-rose-600'
  },
  {
    name: '生命線',
    number: '1995',
    desc: '提供各類心理輔導與協助',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    name: '張老師專線',
    number: '1980',
    desc: '心理諮商與輔導服務',
    color: 'bg-green-50 text-green-600'
  },
  {
    name: '緊急報案',
    number: '110 / 119',
    desc: '立即危險請直接撥打',
    color: 'bg-red-600 text-white'
  }
]
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>

      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <Transition name="modal-scale">
          <div v-if="isOpen" class="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border-4 border-red-50">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="flex items-center gap-4 mb-6">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 text-red-600">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-2xl font-black text-gray-900" id="modal-title">緊急協助</h3>
                  <p class="text-sm text-gray-500 font-bold">如果你覺得無法承受，請尋求幫助。</p>
                </div>
              </div>

              <div class="space-y-4">
                <a
                  v-for="item in resources"
                  :key="item.number"
                  :href="`tel:${item.number}`"
                  class="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-transparent hover:shadow-lg"
                  :class="item.color.includes('white') ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-50 hover:bg-white border-gray-100'"
                >
                  <div>
                    <div class="font-black text-lg">{{ item.name }}</div>
                    <div class="text-xs font-bold opacity-80">{{ item.desc }}</div>
                  </div>
                  <div class="font-mono text-xl font-black tracking-widest">{{ item.number }}</div>
                </a>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button 
                type="button" 
                class="inline-flex w-full justify-center rounded-xl bg-white px-3 py-4 text-sm font-black text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
                @click="emit('close')"
              >
                關閉
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>