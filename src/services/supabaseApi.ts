// src/services/supabaseApi.ts
import { supa } from './supaClient'
import type { TaskRecord, Stats, Task } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/** 核心身分驗證函式：確保取得一個可用的 User ID (Session > LocalStorage > New Anon) */
export async function ensureCurrentUser(): Promise<string> {
  // 1. 優先使用已登入的 Session
  const { data: { session } } = await supa.auth.getSession()
  if (session?.user) {
    return session.user.id
  }

  // 2. 其次使用 Local Storage 的匿名 ID
  let anon = localStorage.getItem('anon_id')
  if (!anon) {
    anon = uuidv4()
    localStorage.setItem('anon_id', anon)
  }
  return anon
}

/** 取得目前登入使用者 (Legacy wrapper) */
export async function getCurrentUser() {
  const { data: { user } } = await supa.auth.getUser()
  return user || null
}

/** 取得或建立使用者 ID (Legacy) */
export async function getOrCreateUser(anonId: string) {
  return ensureCurrentUser()
}

/** 讀取任務列表 */
export async function listTasks(): Promise<Task[]> {
  const userId = await ensureCurrentUser()
  
  // 1. Get Defaults
  const { data: defaults, error: e1 } = await supa
    .from('tasks')
    .select('*')
    .eq('is_default', true)
    .order('title', { ascending: true })

  if (e1) throw e1

  // 2. Get Customs (No RLS means we see all, so filter by creator manually if needed, or rely on Query)
  const { data: customs, error: e2 } = await supa
    .from('tasks')
    .select('*')
    .eq('is_default', false)
    .eq('creator_user', userId)
    .order('created_at', { ascending: true })

  if (e2) throw e2
  
  return [...(defaults || []), ...(customs || [])] as Task[]
}

/** 新增自訂任務 */
export async function createCustomTaskDB(title: string, category: string) {
  const userId = await ensureCurrentUser()

  const { data, error } = await supa
    .from('tasks')
    .insert({
      title,
      category,
      is_default: false,
      creator_user: userId
    })
    .select('*')
    .single()

  if (error) {
    console.error('Create Task Error:', error)
    throw error
  }
  return data
}

/** 刪除自訂任務 */
export async function deleteCustomTask(taskId: string | number) {
  const userId = await ensureCurrentUser()
  const { error } = await supa
    .from('tasks')
    .delete()
    .eq('task_id', taskId)
    .eq('creator_user', userId)

  if (error) throw error
}

/** 建立排程紀錄 (cbt_record) */
export async function scheduleTask(userId: string, taskId: string | number, timeISO: string, notifyTypes: string[] = []) {
  // Double check userId consistency
  const finalUserId = userId || await ensureCurrentUser()
  
  console.log('[API] Scheduling Task:', { user_id: finalUserId, task_id: taskId, time: timeISO })

  const { data, error } = await supa
    .from('cbt_record')
    .insert({
      user_id: finalUserId,
      task_id: taskId,
      scheduled_time: timeISO,
      status: 'pending',
      notify: notifyTypes
    })
    .select('record_id')
    .single()

  if (error) {
    console.error('[API] Schedule FAILED:', error)
    throw error
  }
  
  console.log('[API] Schedule OK:', data.record_id)
  return data.record_id
}

/** 取得儀表板統計資訊 */
export async function stats(userId: string): Promise<Stats> {
  const finalUserId = userId || await ensureCurrentUser()
  const { data, error } = await supa
    .from('cbt_record')
    .select('status, anxiety_before, anxiety_after')
    .eq('user_id', finalUserId)

  if (error) throw error

  const planned = data.length
  const completedRecords = data.filter(r => r.status === 'completed')
  const completed = completedRecords.length
  
  const diffs = completedRecords
    .map(r => (r.anxiety_before ?? 0) - (r.anxiety_after ?? 0))
    .filter(n => !isNaN(n))

  const avgRelief = diffs.length 
    ? parseFloat((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1)) 
    : 0

  return { planned, completed, avg_relief: avgRelief }
}

/** 完成 CBT 反思填寫 */
export async function completeWithCBT(userId: string, recordId: number, payload: any = {}) {
  const finalUserId = userId || await ensureCurrentUser()
  const { error } = await supa
    .from('cbt_record')
    .update({
      status: 'completed',
      thought_before: payload.thought_before,
      anxiety_before: payload.anxiety_before,
      anxiety_after: payload.anxiety_after,
      feeling_after: payload.feeling_after,
      belief_adjustment: payload.belief_adjustment,
      distortions: payload.distortions
    })
    .eq('record_id', recordId)
    .eq('user_id', finalUserId)

  if (error) throw error
  return true
}

/** 取得待辦中的紀錄 (Fixed) */
export async function getPendingRecords(userId: string): Promise<TaskRecord[]> {
  const finalUserId = userId || await ensureCurrentUser()
  console.log('[API] Fetching Pending for:', finalUserId)
  
  const { data, error } = await supa
    .from('cbt_record')
    .select('*, task:tasks(title, category)') // Join tasks table
    .eq('user_id', finalUserId)
    .eq('status', 'pending')
    .order('scheduled_time', { ascending: true })

  if (error) {
    console.error('[API] Fetch Pending Error:', error)
    throw error
  }
  
  console.log('[API] Pending Count:', data.length)
  return data as unknown as TaskRecord[]
}

/** 取得最近完成的紀錄 */
export async function getRecentCompletedRecords(userId: string, limit = 10): Promise<TaskRecord[]> {
  const finalUserId = userId || await ensureCurrentUser()
  const { data, error } = await supa
    .from('cbt_record')
    .select('*')
    .eq('user_id', finalUserId)
    .eq('status', 'completed')
    .order('scheduled_time', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as TaskRecord[]
}

/* ===== 臨時任務處理 (已棄用，整合至 createCustomTaskDB) ===== */
const EPHEMERAL_KEY = 'cbt_ephemeral_tasks'
export function getEphemeralTasks() { return [] }
export function addEphemeralTask(title: string, category: string) { return {} }
export function clearEphemeralTasks() { localStorage.removeItem(EPHEMERAL_KEY) }