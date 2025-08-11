import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Landing.vue') },
  { path: '/tasks', component: () => import('../views/TaskPicker.vue') },
  { path: '/schedule', component: () => import('../views/Schedule.vue') },
  { path: '/notify', component: () => import('../views/Notify.vue') },
  { path: '/complete', component: () => import('../views/CompleteCBT.vue') },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
]
export default createRouter({ history: createWebHistory(), routes })
