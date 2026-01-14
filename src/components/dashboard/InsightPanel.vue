<script setup lang="ts">
import { computed } from 'vue'
import type { TaskRecord } from '@/types'
import { generateInsights } from '@/utils/analysis'
import IconBrain from '@/components/icons/IconBrain.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconPlayCircle from '@/components/icons/IconPlayCircle.vue'

const props = defineProps<{
  records: TaskRecord[]
}>()

const insights = computed(() => generateInsights(props.records))
</script>

<template>
  <div class="space-y-4">
    <div v-for="(insight, index) in insights" :key="index" 
      class="p-5 rounded-2xl border transition-all duration-300 flex gap-4"
      :class="{
        'bg-emerald-50 border-emerald-100': insight.type === 'positive',
        'bg-indigo-50 border-indigo-100': insight.type === 'suggestion',
        'bg-gray-50 border-gray-100': insight.type === 'neutral'
      }"
    >
      <div class="shrink-0">
        <div v-if="insight.type === 'positive'" class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <IconShield class="w-6 h-6" />
        </div>
        <div v-else-if="insight.type === 'suggestion'" class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <IconBrain class="w-6 h-6" />
        </div>
        <div v-else class="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
          <IconPlayCircle class="w-6 h-6" />
        </div>
      </div>
      
      <div>
        <h3 class="font-bold text-gray-900 mb-1">{{ insight.title }}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{{ insight.content }}</p>
      </div>
    </div>
  </div>
</template>
