<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconShield from '@/components/icons/IconShield.vue'

const store = useNotificationStore()
</script>

<template>
  <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 md:px-0">
    <TransitionGroup 
      enter-active-class="transform ease-out duration-500 transition"
      enter-from-class="translate-x-full opacity-0 scale-90"
      enter-to-class="translate-x-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-300 absolute"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-for="note in store.notifications"
        :key="note.id"
        class="pointer-events-auto w-full bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl border border-white p-4 flex items-start gap-4 transform transition-all"
      >
        <!-- Icon Based on Type -->
        <div class="shrink-0">
          <div v-if="note.type === 'success'" class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <IconCheckCircle class="w-6 h-6" />
          </div>
          <div v-else-if="note.type === 'error'" class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <IconShield class="w-6 h-6" />
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm">i</div>
        </div>

        <!-- Content -->
        <div class="flex-1 py-1">
          <p class="text-sm font-black text-gray-900 leading-tight">{{ note.message }}</p>
        </div>

        <!-- Close Button -->
        <button @click="store.remove(note.id)" class="text-gray-300 hover:text-gray-900 transition-colors p-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
