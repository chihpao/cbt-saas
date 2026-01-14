// src/services/supabaseApi.ts
import { supa } from './supaClient'
import type { TaskRecord, Stats, Task } from '@/types'

/** 取得目前登入使用者 */
export async function getCurrentUser() {
  const { data: { user } } = await supa.auth.getUser()
  return user || null
}

/** 取得或建立使用者 ID（支援匿名流程） */
export async function getOrCreateUser(anonId: string) {
  const sessionUser = await getCurrentUser()
  if (sessionUser) return sessionUser.id
  if (!anonId) throw new Error('需要提供 anonId')
  
  try {
    const { data, error } = await supa.rpc('rpc_get_or_create_user', { p_anon_id: anonId })
    if (error) throw error
    return data
  } catch (error: any) {
    console.warn('RPC 失敗，暫時使用 anonId：', error?.message || error)
    return anonId
  }
}

/** 讀取任務列表 */
export async function listTasks(): Promise<Task[]> {
  const user = await getCurrentUser()
  const { data: defaults, error: e1 } = await supa
    .from('tasks')
    .select('*')
    .eq('is_default', true)
    .order('title', { ascending: true })

  if (e1) throw e1

  if (!user) return defaults as Task[]

  const { data: customs, error: e2 } = await supa
    .from('tasks')
    .select('*')
    .eq('is_default', false)
    .eq('creator_user', user.id)
    .order('created_at', { ascending: true })

  if (e2) throw e2
  return [...(defaults || []), ...(customs || [])] as Task[]
}

/** 新增自訂任務 */
export async function createCustomTaskDB(title: string, category: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('需要登入才能儲存自訂任務')

  const { data, error } = await supa
    .from('tasks')
    .insert({
      title,
      category,
      is_default: false,
      creator_user: user.id
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/** 刪除自訂任務 */
export async function deleteCustomTask(taskId: string | number) {
  const user = await getCurrentUser()
  if (!user) throw new Error('需要登入')

  const { error } = await supa
    .from('tasks')
    .delete()
    .eq('task_id', taskId)
    .eq('creator_user', user.id) // 安全檢查：只能刪自己的

  if (error) throw error
}

/** 建立排程紀錄 (cbt_record) */
export async function scheduleTask(userId: string, taskId: string | number, timeISO: string, notifyTypes: string[] = []) {
  if (!userId) throw new Error('缺少 userId')

  const { data, error } = await supa
    .from('cbt_record')
    .insert({
      user_id: userId,
      task_id: taskId,
      scheduled_time: timeISO,
      status: 'pending',
      notify: notifyTypes
    })
    .select('record_id')
    .single()

  if (error) throw error
  return data.record_id
}

/** 取得儀表板統計資訊 */
export async function stats(userId: string): Promise<Stats> {
  const { data, error } = await supa
    .from('cbt_record')
    .select('status, anxiety_before, anxiety_after')
    .eq('user_id', userId)

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
  const { error } = await supa
    .from('cbt_record')
    .update({
      status: 'completed',
      thought_before: payload.thought_before,
      anxiety_before: payload.anxiety_before,
      anxiety_after: payload.anxiety_after,
      feeling_after: payload.feeling_after,
      belief_adjustment: payload.belief_adjustment
    })
    .eq('record_id', recordId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

/** 取得待辦中的紀錄 */
export async function getPendingRecords(userId: string): Promise<TaskRecord[]> {
  const { data, error } = await supa
    .from('cbt_record')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data as TaskRecord[]
}

/** 取得最近完成的紀錄 (用於圖表) */
export async function getRecentCompletedRecords(userId: string, limit = 10): Promise<TaskRecord[]> {
  const { data, error } = await supa
    .from('cbt_record')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('scheduled_time', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as TaskRecord[]
}

/* ===== 臨時任務處理 ===== */
const EPHEMERAL_KEY = 'cbt_ephemeral_tasks'
export function getEphemeralTasks() {
  try { return JSON.parse(localStorage.getItem(EPHEMERAL_KEY) || '[]') } catch { return [] }
}
export function addEphemeralTask(title: string, category: string) {
  const list = getEphemeralTasks()
  const newTask = { task_id: 'tmp_' + Math.random().toString(36).slice(2), title, category, is_default: false, _ephemeral: true }
  list.push(newTask)
  localStorage.setItem(EPHEMERAL_KEY, JSON.stringify(list))
  return newTask
}
export function clearEphemeralTasks() { localStorage.removeItem(EPHEMERAL_KEY) }