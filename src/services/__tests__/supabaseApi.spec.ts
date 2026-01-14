import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getEphemeralTasks, addEphemeralTask, clearEphemeralTasks } from '../supabaseApi'

describe('supabaseApi Ephemeral Tasks', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('應該能新增並讀取臨時任務', () => {
    const title = '測試任務'
    const category = '心理'
    
    addEphemeralTask(title, category)
    const tasks = getEphemeralTasks()
    
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe(title)
    expect(tasks[0].category).toBe(category)
    expect(tasks[0]._ephemeral).toBe(true)
  })

  it('應該能清除所有臨時任務', () => {
    addEphemeralTask('T1', 'C1')
    addEphemeralTask('T2', 'C2')
    
    clearEphemeralTasks()
    const tasks = getEphemeralTasks()
    
    expect(tasks).toHaveLength(0)
  })
})
