// src/services/supabaseApi.js
import { supa } from './supaClient'

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
    .order('title', { ascending: true })

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

/** 建立排程記錄，回傳 record_id（未登入也允許透過 anon user id） */
export async function scheduleTask(userId, taskId, timeISO, notifyTypes = []) {
  if (!userId) throw new Error('缺少 userId')
  if (!timeISO) throw new Error('缺少排程時間')

  const { data, error } = await supa.rpc('rpc_schedule', {
    p_user: userId,
    p_task_id: taskId ?? null,
    p_time: timeISO,
    p_notify_types: notifyTypes
  })

  if (error) throw error
  return data ?? null
}

/** 儀表板統計資訊 */
export async function stats(userId) {
  if (!userId) throw new Error('缺少 userId')

  const { data, error } = await supa.rpc('rpc_stats', { p_user: userId })
  if (error) throw error
  return data || { planned: 0, completed: 0, avg_relief: 0 }
}


/** CBT 完成填寫 */
export async function completeWithCBT(userId, recordId, payload = {}) {
  if (!userId) throw new Error('缺少 userId')
  if (!recordId) throw new Error('缺少 recordId')

  const { error } = await supa.rpc('rpc_complete_with_cbt', {
    p_user: userId,
    p_record: recordId,
    p_thought: payload.thought_before ?? null,
    p_before: payload.anxiety_before ?? null,
    p_after: payload.anxiety_after ?? null,
    p_feel: payload.feeling_after ?? null,
    p_belief: payload.belief_adjustment ?? null
  })

  if (error) throw error
  return true
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

