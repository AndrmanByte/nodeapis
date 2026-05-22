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

// POST - 向已有活动批量添加兑换码
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { codes } = body

    if (!codes || codes.length === 0) {
      return NextResponse.json({ success: false, error: '兑换码不能为空' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: offer } = await supabase
      .from('trial_offers')
      .select('id')
      .eq('id', id)
      .single()

    if (!offer) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 })
    }

    const codeRows = codes.map((code: string) => ({
      trial_offer_id: id,
      code: code.trim(),
    }))

    const { data, error } = await supabase
      .from('trial_codes')
      .insert(codeRows)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data, count: data.length })
  } catch (error) {
    console.error('Add codes error:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}
