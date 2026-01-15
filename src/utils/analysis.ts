import type { TaskRecord } from '@/types'

export interface Insight {
  title: string
  content: string
  type: 'positive' | 'neutral' | 'suggestion'
}

export function generateInsights(records: TaskRecord[]): Insight[] {
  const completed = records.filter(r => r.status === 'completed' && r.anxiety_before !== undefined && r.anxiety_after !== undefined)
  
  if (completed.length < 3) {
    return [{
      title: '正在收集數據',
      content: '再完成 ' + (3 - completed.length) + ' 次挑戰，系統將能為您分析焦慮模式。',
      type: 'neutral'
    }]
  }

  const insights: Insight[] = []

  // 1. 焦慮緩解總覽
  const totalRelief = completed.reduce((acc, r) => acc + ((r.anxiety_before || 0) - (r.anxiety_after || 0)), 0)
  const avgRelief = totalRelief / completed.length

  if (avgRelief > 3) {
    insights.push({
      title: '顯著的進步',
      content: `平均每次行動能幫您降低 ${avgRelief.toFixed(1)} 分焦慮。這證明了「行動」確實能有效對抗情緒。`,
      type: 'positive'
    })
  }

  // 2. 預期偏差分析 (Catastrophizing Check)
  // 如果做之前的焦慮很高，但做完後很低，說明使用者傾向於「災難化」預期
  const highAnxietyBefore = completed.filter(r => (r.anxiety_before || 0) >= 7)
  const reliefAfterHigh = highAnxietyBefore.filter(r => (r.anxiety_after || 0) <= 4)
  
  if (reliefAfterHigh.length >= 2) {
    insights.push({
      title: '發現「預期偏差」',
      content: '數據顯示，即使您在開始前感到極度焦慮，完成後通常都能大幅放鬆。下次感到恐懼時，請試著告訴自己：預期的痛苦通常比實際發生的要大。',
      type: 'suggestion'
    })
  }

  // 3. 最有效的類別 (這部分需要 JoinedTaskRecord，目前先以現有資料處理)
  // 這裡是一個簡單的邏輯占位
  if (completed.length >= 5) {
     insights.push({
      title: '建立習慣中',
      content: '您已經累積了 5 次成功的經驗。這些紀錄是您勇氣的證明，在下次感到困難時可以回來翻閱。',
      type: 'positive'
    })
  }

  // 4. 認知謬誤分析 (Cognitive Distortions)
  const allDistortions = completed.flatMap(r => r.distortions || [])
  if (allDistortions.length > 0) {
    const counts: Record<string, number> = {}
    allDistortions.forEach(d => counts[d] = (counts[d] || 0) + 1)
    
    const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    
    const labelMap: Record<string, string> = {
      'all_or_nothing': '非黑即白',
      'catastrophizing': '災難化思考',
      'emotional_reasoning': '情緒化推理',
      'mind_reading': '讀心術',
      'should_statements': '應該/必須',
      'personalization': '個人化'
    }

    if (mostFrequent && mostFrequent[1] >= 2) {
      insights.push({
        title: `注意到思考慣性：${labelMap[mostFrequent[0]] || mostFrequent[0]}`,
        content: `最近您有 ${mostFrequent[1]} 次反思中提到了這個思考陷阱。識別它是改變的第一步，下次出現類似想法時，試著問問自己：有其他可能的解釋嗎？`,
        type: 'suggestion'
      })
    }
  }

  return insights
}
