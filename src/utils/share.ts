// src/utils/share.ts

// 把本地時間（YYYY-MM-DDTHH:mm）轉成 Google 需要的 UTC：YYYYMMDDTHHMMSSZ
export function toGoogleDateUTC(localISO_ymdhm: string, durationMinutes = 30) {
    const startLocal = new Date(localISO_ymdhm)
    const endLocal = new Date(startLocal.getTime() + durationMinutes * 60000)
  
    const pad = (n: number) => String(n).padStart(2, '0')
    const toUtcChunk = (d: Date) =>
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
  
    return { start: toUtcChunk(startLocal), end: toUtcChunk(endLocal) }
  }
  
  interface GoogleCalendarParams {
      title: string
      startLocalYmdHm: string
      duration?: number
      description?: string
      location?: string
  }

  export function buildGoogleCalendarUrl({ title, startLocalYmdHm, duration = 30, description = '', location = '' }: GoogleCalendarParams) {
    const { start, end } = toGoogleDateUTC(startLocalYmdHm, duration)
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title || '事件',
      dates: `${start}/${end}`,
    })
    if (description) params.set('details', description)
    if (location) params.set('location', location)
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }