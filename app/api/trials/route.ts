import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - 获取所有有效的试用活动（聚合页用，含可用码数）
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('trial_offers')
      .select('*, provider:providers(*)')
      .eq('is_active', true)
      .order('highlight_order', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 过滤掉已过期的和关联中转站未发布的
    const now = new Date().toISOString()
    const valid = (data || []).filter(
      (t) =>
        (!t.expires_at || t.expires_at > now) &&
        t.provider &&
        t.provider.is_published !== false
    )

    // 获取每个活动的可用码数
    const withCounts = await Promise.all(
      valid.map(async (offer) => {
        const { count } = await supabase
          .from('trial_codes')
          .select('*', { count: 'exact', head: true })
          .eq('trial_offer_id', offer.id)
          .eq('status', 'available')
        return { ...offer, available_codes_count: count || 0 }
      })
    )

    // 只返回还有可用码的活动
    const available = withCounts.filter((t) => t.available_codes_count > 0)

    return NextResponse.json({ success: true, data: available })
  } catch {
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    )
  }
}
