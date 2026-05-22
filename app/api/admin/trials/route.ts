import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function verifyAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  return token.length > 0
}

// GET - 获取所有试用活动（含兑换码）
export async function GET() {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('trial_offers')
      .select('*, provider:providers(id, name, logo_url), trial_codes(*)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 })
  }
}

// POST - 管理员创建试用活动（含批量兑换码）
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { provider_id, amount, description, highlight_order, expires_at, codes, points_cost } = body

    if (!provider_id || !amount?.trim()) {
      return NextResponse.json({ success: false, error: '中转站和试用金额不能为空' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: offer, error: offerError } = await supabase
      .from('trial_offers')
      .insert({
        provider_id,
        amount: amount.trim(),
        description: description?.trim() || null,
        points_cost: points_cost || 0,
        highlight_order: highlight_order || 0,
        expires_at: expires_at || null,
      })
      .select()
      .single()

    if (offerError) throw offerError

    if (codes && codes.length > 0) {
      const codeRows = codes.map((code: string) => ({
        trial_offer_id: offer.id,
        code: code.trim(),
      }))
      const { error: codesError } = await supabase
        .from('trial_codes')
        .insert(codeRows)
      if (codesError) throw codesError
    }

    return NextResponse.json({ success: true, data: offer })
  } catch (error) {
    console.error('Admin create trial error:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}
