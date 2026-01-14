<template>
  <div class="min-h-svh bg-[#FAFAFA] text-gray-900 antialiased selection:bg-indigo-100 selection:text-indigo-700">
    <ToastContainer />
    
    <!-- Fullscreen Layout (Landing, Auth) -->
    <div v-if="isFullScreen">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- App Layout (Dashboard, Tasks) -->
    <AppLayout v-else>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
    </AppLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()

// Define routes that should use the fullscreen layout (no sidebar)
const fullScreenRoutes = ['/', '/login', '/register', '/terms', '/privacy']

const isFullScreen = computed(() => {
  return fullScreenRoutes.includes(route.path)
})
</script>

<style>
/* Global Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Base styles for interactivity */
button, a {
  cursor: pointer;
}

/* Custom scrollbar for better look */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
