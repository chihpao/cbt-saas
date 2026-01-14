import { createClient } from '@supabase/supabase-js'

export const supa = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON,
  {
    auth: {
      persistSession: true, // 啟用會話持久化
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
)

// 導出一個函數來檢查用戶是否已登入
export const getCurrentUser = async () => {
  const { data: { session } } = await supa.auth.getSession()
  return session?.user || null
}

// 導出一個函數來獲取當前會話
export const getCurrentSession = async () => {
  const { data: { session } } = await supa.auth.getSession()
  return session
}

// 導出一個函數來登出
export const signOut = async () => {
  const { error } = await supa.auth.signOut()
  if (error) throw error
}