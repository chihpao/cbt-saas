export function buildICS({ uid, title, startISO, endISO, desc }) {
    const dt = iso => iso.replace(/[-:]/g,'').replace(/\.\d{3}Z?$/,'Z')
    return [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CBT SaaS//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`, `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(startISO)}`, `DTEND:${dt(endISO)}`,
      `SUMMARY:${title}`, `DESCRIPTION:${desc||''}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n')
  }
  export function downloadICS(name, content){
    const blob = new Blob([content], { type:'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url)
  }
  