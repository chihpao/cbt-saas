import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { supa } from '@/services/supaClient.ts'

const routes = [
  {
    path: '/',
    component: () => import('../views/Landing.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/tasks',
    component: () => import('../views/TaskPicker.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/complete',
    component: () => import('../views/CompleteCBT.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    component: () => import('../views/Terms.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/privacy',
    component: () => import('../views/Privacy.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/logout',
    redirect: '/',
    beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      await supa.auth.signOut()
      next('/')
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛：檢查用戶是否已登入
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const { data: { session } } = await supa.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    // 如果路由需要登入但用戶未登入，則重定向到登入頁面
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/') && session) {
    // 如果用戶已登入但嘗試訪問登入、註冊或首頁，則重定向到 Home
    next('/home')
  } else {
    // 否則繼續導航
    next()
  }
})

export default router