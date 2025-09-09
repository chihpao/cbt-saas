import { createRouter, createWebHistory } from 'vue-router'
import { supa } from '@/services/supaClient'

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
    path: '/schedule', 
    component: () => import('../views/Schedule.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/notify', 
    component: () => import('../views/Notify.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/complete', 
    component: () => import('../views/CompleteCBT.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/dashboard', 
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/logout',
    redirect: '/',
    beforeEnter: async (to, from, next) => {
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
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supa.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    // 如果路由需要登入但用戶未登入，則重定向到登入頁面
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && session) {
    // 如果用戶已登入但嘗試訪問登入或註冊頁面，則重定向到首頁
    next('/')
  } else {
    // 否則繼續導航
    next()
  }
})

export default router
