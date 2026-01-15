export interface Task {
  task_id: string | number
  title: string
  description?: string
  category: string
  is_default: boolean
  creator_user?: string
}

export interface TaskRecord {
  record_id: number
  user_id?: string // Added
  task_id: string | number
  scheduled_time: string
  status: 'pending' | 'completed'
  notify?: string[]
  // Fields from DB columns
  anxiety_before?: number
  anxiety_after?: number
  thought_before?: string
  feeling_after?: string
  belief_adjustment?: string
  distortions?: string[]
}

export interface Stats {
  planned: number
  completed: number
  avg_relief: number | string
}

export interface JoinedTaskRecord extends TaskRecord {
  task_title: string
  task_category: string
}