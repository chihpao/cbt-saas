<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  records: Array<{
    scheduled_time: string
    anxiety_before?: number
    anxiety_after?: number
  }>
}>()

const chartData = computed(() => {
  // Take last 7 completed records
  const recent = props.records
    .filter(r => r.anxiety_before !== undefined && r.anxiety_after !== undefined)
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
    .slice(-7)

  return {
    labels: recent.map(r => new Date(r.scheduled_time).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })),
    datasets: [
      {
        label: '做之前的焦慮',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1', // Indigo-500
        pointBackgroundColor: '#6366f1',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        data: recent.map(r => r.anxiety_before || 0)
      },
      {
        label: '做之後的焦慮',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981', // Emerald-500
        pointBackgroundColor: '#10b981',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        data: recent.map(r => r.anxiety_after || 0)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    y: {
      min: 0,
      max: 10,
      grid: { color: '#f3f4f6' },
      ticks: { stepSize: 2 }
    },
    x: {
      grid: { display: false }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
}
</script>

<template>
  <div class="w-full h-full">
    <Line v-if="chartData.labels.length > 1" :data="chartData" :options="chartOptions" />
    <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
      <p>累積至少兩筆紀錄後</p>
      <p>將在此顯示您的焦慮改善趨勢</p>
    </div>
  </div>
</template>
