const sleep = (ms)=> new Promise(r=>setTimeout(r,ms))
const LS = (k,v)=> v===undefined ? JSON.parse(localStorage.getItem(k)||'null')
                                  : localStorage.setItem(k, JSON.stringify(v))

export async function listTasks(userId){
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
export async function createCustomTask(userId, title, desc=''){
  await sleep(100)
  const custom = LS(`custom_${userId}`) || []
  const task_id = custom.length ? custom.at(-1).task_id + 1 : 1001
  custom.push({ task_id, title, description:desc, is_default:false })
  LS(`custom_${userId}`, custom)
  return task_id
}
export async function scheduleTask(userId, task_id, timeISO, notifyTypes=[]){
  await sleep(100)
  const recs = LS(`records_${userId}`) || []
  const record_id = recs.length + 1
  recs.push({ record_id, task_id, scheduled_time: timeISO, status:'pending', notify: notifyTypes })
  LS(`records_${userId}`, recs)
  return record_id
}
export async function completeWithCBT(userId, record_id, payload){
  await sleep(100)
  const recs = LS(`records_${userId}`) || []
  const r = recs.find(x=>x.record_id===record_id)
  if(r){ r.status='completed'; r.cbt = payload }
  LS(`records_${userId}`, recs)
  return true
}
export async function stats(userId){
  await sleep(80)
  const recs = (LS(`records_${userId}`) || [])
  const done = recs.filter(r=>r.status==='completed')
  const diffs = done.map(r => (r?.cbt?.anxiety_before??0) - (r?.cbt?.anxiety_after??0)).filter(n=>!isNaN(n))
  return { planned: recs.length, completed: done.length, avg_relief: diffs.length? (diffs.reduce((a,b)=>a+b,0)/diffs.length).toFixed(1): 0 }
}
