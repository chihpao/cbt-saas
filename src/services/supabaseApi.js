import { supa } from './supaClient'

export async function getOrCreateUser(anonId) {
  const { data, error } = await supa.rpc('rpc_get_or_create_user', { p_anon_id: anonId })
  if (error) throw error
  return data // uuid
}

export async function listTasks(userId) {
  const { data, error } = await supa.rpc('rpc_list_tasks', { p_user: userId })
  if (error) throw error
  return data // [{task_id,title,description,is_default}]
}

export async function createCustomTask(userId, title, desc='') {
  const { data, error } = await supa.rpc('rpc_create_custom_task', {
    p_user: userId, p_title: title, p_desc: desc
  })
  if (error) throw error
  return data // task_id
}

export async function scheduleTask(userId, task_id, timeISO, notifyTypes=[]) {
  const { data, error } = await supa.rpc('rpc_schedule', {
    p_user: userId, p_task_id: task_id, p_time: timeISO, p_notify_types: notifyTypes
  })
  if (error) throw error
  return data // record_id
}

export async function completeWithCBT(userId, record_id, payload) {
  const { error } = await supa.rpc('rpc_complete_with_cbt', {
    p_user:   userId,
    p_record: record_id,
    p_thought: payload.thought_before,
    p_before:  payload.anxiety_before,
    p_after:   payload.anxiety_after,
    p_feel:    payload.feeling_after,
    p_belief:  payload.belief_adjustment
  })
  if (error) throw error
  return true
}

/** 儀表板統計：需要你在 DB 建 rpc_stats（下面有 SQL） */
export async function stats(userId) {
  const { data, error } = await supa.rpc('rpc_stats', { p_user: userId })
  if (error) throw error
  // data 可能是 [] 或 [{ planned, completed, avg_relief }]
  const row = Array.isArray(data) ? data[0] : data
  return row ?? { planned: 0, completed: 0, avg_relief: 0 }
}

