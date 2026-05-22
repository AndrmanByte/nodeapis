import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - 获取某中转站的试用活动（含可用码数）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('trial_offers')
      .select('*')
      .eq('provider_id', id)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('highlight_order', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 获取每个活动的可用码数
    const offersWithCounts = await Promise.all(
      (data || []).map(async (offer) => {
        const { count } = await supabase
          .from('trial_codes')
          .select('*', { count: 'exact', head: true })
          .eq('trial_offer_id', offer.id)
          .eq('status', 'available')
        return { ...offer, available_codes_count: count || 0 }
      })
    )

    return NextResponse.json({ success: true, data: offersWithCounts })
  } catch {
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    )
  }
}

// POST - 店家发布试用活动
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    // 验证是否是店铺所有者
    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!provider || provider.owner_id !== user.id) {
      return NextResponse.json({ success: false, error: '无权限操作此店铺' }, { status: 403 })
    }

    const body = await request.json()
    const { amount, description, highlight_order, expires_at, codes, points_cost } = body

    if (!amount || !amount.trim()) {
      return NextResponse.json({ success: false, error: '试用金额不能为空' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 创建试用活动
    const { data: offer, error: offerError } = await adminSupabase
      .from('trial_offers')
      .insert({
        provider_id: id,
        amount: amount.trim(),
        description: description?.trim() || null,
        points_cost: points_cost || 0,
        highlight_order: highlight_order || 0,
        expires_at: expires_at || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (offerError) throw offerError

    // 批量插入兑换码
    if (codes && codes.length > 0) {
      const codeRows = codes.map((code: string) => ({
        trial_offer_id: offer.id,
        code: code.trim(),
      }))
      const { error: codesError } = await adminSupabase
        .from('trial_codes')
        .insert(codeRows)
      if (codesError) throw codesError
    }

    return NextResponse.json({ success: true, data: offer })
  } catch (error) {
    console.error('Create trial offer error:', error)
    return NextResponse.json({ success: false, error: '发布失败' }, { status: 500 })
  }
}
