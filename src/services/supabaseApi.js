// src/services/supabaseApi.js
import { supa } from './supaClient'

// Helper for Local Storage Fallback (Backend RPCs are broken)
const LS = (k, v) => v === undefined ? JSON.parse(localStorage.getItem(k) || 'null') : localStorage.setItem(k, JSON.stringify(v))

/** 取得目前登入使用者（沒有就回 null） */
export async function getCurrentUser() {
  const { data: { user } } = await supa.auth.getUser()
  return user || null
}

/** 取得目前 Session（若失敗回 null） */
export async function getCurrentSession() {
  const { data: { session }, error } = await supa.auth.getSession()
  if (error) {
    console.warn('getSession 失敗', error)
    return null
  }
  return session || null
}

/**
 * 匿名流程使用：
 * - 若已登入，直接回傳 Supabase user id
 * - 未登入時，透過 RPC 以 anon_id 建立/取得後端的對應使用者 id
 * - 若 RPC 失敗，最後退回原本 anonId，至少讓前端後續流程可以繼續
 */
export async function getOrCreateUser(anonId) {
  const sessionUser = await getCurrentUser()
  if (sessionUser) return sessionUser.id

  if (!anonId) throw new Error('需要提供 anonId')
  try {
    const { data, error } = await supa.rpc('rpc_get_or_create_user', { p_anon_id: anonId })
    if (error) throw error
    return data
  } catch (error) {
    console.warn('rpc_get_or_create_user 失敗，改用本地 anonId：', error?.message || error)
    return anonId
  }
}

/**
 * 讀任務：
 * - 未登入 → 只回預設任務
 * - 已登入 → 預設 + 自訂任務
 */
export async function listTasks() {
  const user = await getCurrentUser()

  const { data: defaults, error: e1 } = await supa
    .from('tasks')
    .select('task_id, title, description, category, is_default')
    .eq('is_default', true)
    .order('title', { ascending: true })

  if (e1) throw e1

  if (!user) {
    return defaults
  }

  const { data: customs, error: e2 } = await supa
    .from('tasks')
    .select('task_id, title, description, category, is_default')
    .eq('is_default', false)
    .eq('creator_user', user.id)
    .order('created_at', { ascending: true })

  if (e2) throw e2

  return [...defaults, ...customs]
}

/** 已登入才可呼叫：新增自訂任務 */
export async function createCustomTaskDB(title, category) {
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
    .select('task_id, title, category, is_default')
    .single()

  if (error) throw error
  return data
}

/** 刪除自己的自訂任務 */
export async function deleteCustomTask(taskId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('需要登入')

  const { error } = await supa
    .from('tasks')
    .delete()
    .eq('task_id', taskId)

  if (error) throw error
}

/** 更新自己的自訂任務（例如改標題/類別） */
export async function updateCustomTask(taskId, patch) {
  const user = await getCurrentUser()
  if (!user) throw new Error('需要登入')

  const { data, error } = await supa
    .from('tasks')
    .update({ ...patch })
    .eq('task_id', taskId)
    .select('task_id, title, category, is_default')
    .single()

  if (error) throw error
  return data
}

/** 建立排程記錄，回傳 record_id（使用 LocalStorage 當作 Fallback） */
export async function scheduleTask(userId, taskId, timeISO, notifyTypes = []) {
  if (!userId) throw new Error('缺少 userId')
  if (!timeISO) throw new Error('缺少排程時間')

  // NOTE: Backend RPC 'rpc_schedule' fails due to type mismatch (UUID vs BigInt).
  // Falling back to LocalStorage implementation to allow app to function.
  console.warn('Backend RPC broken, using LocalStorage for scheduleTask')
  
  const recs = LS(`records_${userId}`) || []
  const record_id = recs.length ? (Math.max(...recs.map(r => r.record_id)) + 1) : 1
  recs.push({ 
      record_id, 
      task_id: taskId, 
      scheduled_time: timeISO, 
      status: 'pending', 
      notify: notifyTypes 
  })
  LS(`records_${userId}`, recs)
  return record_id
}

/** 儀表板統計資訊 (LocalStorage Fallback) */
export async function stats(userId) {
  if (!userId) throw new Error('缺少 userId')

  // NOTE: Backend RPC 'rpc_stats' likely broken or returns 0 due to missing records table access.
  // Using LocalStorage stats.
  const recs = (LS(`records_${userId}`) || [])
  const done = recs.filter(r => r.status === 'completed')
  const diffs = done.map(r => (r?.cbt?.anxiety_before ?? 0) - (r?.cbt?.anxiety_after ?? 0)).filter(n => !isNaN(n))
  
  return { 
      planned: recs.length, 
      completed: done.length, 
      avg_relief: diffs.length ? (diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1) : 0 
  }
}


/** CBT 完成填寫 (LocalStorage Fallback) */
export async function completeWithCBT(userId, recordId, payload = {}) {
  if (!userId) throw new Error('缺少 userId')
  if (!recordId) throw new Error('缺少 recordId')

  // NOTE: Backend RPC broken. Using LocalStorage.
  console.warn('Backend RPC broken, using LocalStorage for completeWithCBT')

  const recs = LS(`records_${userId}`) || []
  // Ensure recordId is treated as number if it comes from our LS generator
  const r = recs.find(x => x.record_id == recordId)
  
  if (r) { 
      r.status = 'completed'
      r.cbt = payload 
      LS(`records_${userId}`, recs)
      return true
  } else {
      throw new Error('找不到該紀錄 (Local)')
  }
}

/** 取得待辦中的紀錄 (LocalStorage) */
export async function getPendingRecords(userId) {
  if (!userId) return []
  const recs = LS(`records_${userId}`) || []
  return recs.filter(r => r.status === 'pending').sort((a,b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
}

/* ===== 未登入使用者：暫存任務（存在 localStorage） ===== */
const EPHEMERAL_KEY = 'cbt_ephemeral_tasks'

export function getEphemeralTasks() {
  try {
    return JSON.parse(localStorage.getItem(EPHEMERAL_KEY) || '[]')
  } catch {
    return []
  }
}

export function addEphemeralTask(title, category) {
  const list = getEphemeralTasks()
  const temp_id = 'tmp_' + Math.random().toString(36).slice(2)
  list.push({
    task_id: temp_id,
    title,
    category,
    is_default: false,
    _ephemeral: true
  })
  localStorage.setItem(EPHEMERAL_KEY, JSON.stringify(list))
  return list.at(-1)
}

export function clearEphemeralTasks() {
  localStorage.removeItem(EPHEMERAL_KEY)
}

