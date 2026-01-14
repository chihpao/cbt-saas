const sleep = (ms: number)=> new Promise(r=>setTimeout(r,ms))
const LS = (k: string, v?: any)=> v===undefined ? JSON.parse(localStorage.getItem(k)||'null')
                                  : localStorage.setItem(k, JSON.stringify(v))

export async function listTasks(userId: string){
  await sleep(100)
  const defaults = [
    {task_id:1, title:'散步 10 分鐘', is_default:true},
    {task_id:2, title:'感恩清單 3 件', is_default:true},
    {task_id:3, title:'呼吸放鬆 5 分鐘', is_default:true},
    {task_id:4, title:'打電話給朋友', is_default:true},
  ]
  const custom = LS(`custom_${userId}`) || []
  return [...defaults, ...custom]
}
export async function createCustomTask(userId: string, title: string, desc=''){
  await sleep(100)
  const custom = LS(`custom_${userId}`) || []
  const task_id = custom.length ? custom.at(-1).task_id + 1 : 1001
  custom.push({ task_id, title, description:desc, is_default:false })
  LS(`custom_${userId}`, custom)
  return task_id
}
export async function scheduleTask(userId: string, task_id: number | string, timeISO: string, notifyTypes: string[] = []){
  await sleep(100)
  const recs = LS(`records_${userId}`) || []
  const record_id = recs.length + 1
  recs.push({ record_id, task_id, scheduled_time: timeISO, status:'pending', notify: notifyTypes })
  LS(`records_${userId}`, recs)
  return record_id
}
export async function completeWithCBT(userId: string, record_id: number, payload: any){
  await sleep(100)
  const recs = LS(`records_${userId}`) || []
  const r = recs.find((x: any)=>x.record_id===record_id)
  if(r){ r.status='completed'; r.cbt = payload }
  LS(`records_${userId}`, recs)
  return true
}
export async function stats(userId: string){
  await sleep(80)
  const recs = (LS(`records_${userId}`) || [])
  const done = recs.filter((r: any)=>r.status==='completed')
  const diffs = done.map((r: any) => (r?.cbt?.anxiety_before??0) - (r?.cbt?.anxiety_after??0)).filter((n: number)=>!isNaN(n))
  return { planned: recs.length, completed: done.length, avg_relief: diffs.length? (diffs.reduce((a: number,b: number)=>a+b,0)/diffs.length).toFixed(1): 0 }
}