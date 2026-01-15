import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. 檢查 API Key
    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY')
    }

    // 2. 初始化 Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. 抓取所有使用者 (實際生產環境建議分批處理)
    // 假設我們有一個 profiles table，或者您可以直接用 admin auth api 列出使用者
    // 這裡示範從 profiles 抓取
    const { data: users, error: userError } = await supabase
      .from('profiles') 
      .select('id, email, full_name') // 確保您的 profiles 表有 email 欄位，或從 auth.users 同步

    if (userError) {
        console.error('Error fetching users:', userError)
        // 如果沒有 profiles 表，這一步會失敗。
        // 在簡單專案中，您可以略過這步，直接測試寄給自己。
        // 為了演示，我們這裡假裝寄給一個測試信箱 (請換成您自己的收件信箱測試)
        // return new Response("請先設定 Users 來源", { status: 500 })
    }
    
    // ** 測試模式：請將下面的 email 換成您註冊 Resend 的信箱以進行測試 **
    const testUsers = [{ email: 'chihpaoo@gmail.com', full_name: '開發者測試', id: 'test-id' }] 
    const targetUsers = users && users.length > 0 ? users : testUsers

    const results = []
    
    for (const user of targetUsers) {
      if (!user.email) continue

      // 4. 抓取該使用者上週數據
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { data: tasks } = await supabase
        .from('cbt_record') // 注意：這裡是 cbt_record 表
        .select('anxiety_before, anxiety_after')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('scheduled_time', oneWeekAgo.toISOString())

      // 計算統計
      const totalTasks = tasks?.length || 0
      let avgAnxietyDrop = 0
      
      if (totalTasks > 0 && tasks) {
        const totalDrop = tasks.reduce((acc, curr) => {
          return acc + ((curr.anxiety_before || 0) - (curr.anxiety_after || 0))
        }, 0)
        avgAnxietyDrop = totalDrop / totalTasks
      }

      // 如果本週沒有活動，可能寄送鼓勵信，或跳過
      // 這裡示範無論如何都寄送
      
      // 5. 呼叫 Resend API 發信
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'CBT 小幫手 <onboarding@resend.dev>', // Resend 免費版預設網域
          to: [user.email],
          subject: `【CBT 小幫手】您的本週情緒週報 📊`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h1>Hi ${user.full_name || '朋友'},</h1>
              <p>這是您過去一週的情緒健康摘要：</p>
              <ul>
                <li>完成練習次數：<strong>${totalTasks}</strong> 次</li>
                <li>焦慮指數平均下降：<strong>${avgAnxietyDrop.toFixed(1)}</strong> 分</li>
              </ul>
              <p>${totalTasks > 0 ? '做得好！持續練習有助於大腦建立新的迴路。' : '這週似乎比較忙碌？別忘了花點時間照顧自己的情緒喔。'}</p>
              <br/>
              <a href="https://your-app-url.com" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">回到小幫手</a>
            </div>
          `
        })
      })

      const data = await res.json()
      results.push({ email: user.email, resend_id: data.id })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})