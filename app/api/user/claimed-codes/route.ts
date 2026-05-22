import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - 获取当前用户领取的所有兑换码
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('trial_codes')
      .select(`
        id,
        code,
        claimed_at,
        trial_offer:trial_offer_id (
          id,
          amount,
          description,
          provider:provider_id (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('claimed_by', user.id)
      .not('claimed_at', 'is', null)
      .order('claimed_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    )
  }
}
