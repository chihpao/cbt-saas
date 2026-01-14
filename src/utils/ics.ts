export function buildICS({ uid, title, startISO, endISO, desc }: { uid: string, title: string, startISO: string, endISO: string, desc?: string }) {
  const dt = (iso: string) => iso.replace(/[-:]/g,'').replace(/\.\d{3}Z?$/,'Z')
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CBT SaaS//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(startISO)}`, `DTEND:${dt(endISO)}`,
    `SUMMARY:${title}`, `DESCRIPTION:${desc||''}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n')
}

export function downloadICS(name: string, content: string){
  const blob = new Blob([content], { type:'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob); const a=document.createElement('a')
  a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url)
}

export function addToCalendar(payload: { title: string, description?: string, startTime: string, durationMinutes: number }) {
  const start = new Date(payload.startTime)
  const end = new Date(start.getTime() + payload.durationMinutes * 60000)
  
  const icsContent = buildICS({
    uid: 'cbt_' + Date.now() + Math.random().toString(36).slice(2),
    title: payload.title,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    desc: payload.description
  })
  
  downloadICS('cbt-schedule.ics', icsContent)
}

