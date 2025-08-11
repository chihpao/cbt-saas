import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    userId: 'demo-user',         // 先 mock，之後接後端 user_id
    tasks: [],
    selectedTask: null,
    scheduledTime: '',
    notifyTypes: [],
    lastRecordId: null,
  }),
  actions: {
    resetFlow(){
      this.selectedTask = null
      this.scheduledTime = ''
      this.notifyTypes = []
      this.lastRecordId = null
    }
  }
})
