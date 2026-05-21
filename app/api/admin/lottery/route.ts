import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 管理员获取所有抽奖活动
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    if (process.env.NODE_ENV !== 'development') {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!admin) {
        return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
      }
    }

    const { data, error } = await adminSupabase
      .from('lottery_events')
      .select(`
        *,
        provider:providers(id, name, logo_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get lottery events error:', error)
    return NextResponse.json({ success: false, error: '获取抽奖活动失败' }, { status: 500 })
  }
}

// 管理员创建抽奖活动
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    if (process.env.NODE_ENV !== 'development') {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!admin) {
        return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
      }
    }

    const body = await request.json()

    const { data, error } = await adminSupabase
      .from('lottery_events')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create lottery event error:', error)
    return NextResponse.json({ success: false, error: '创建抽奖活动失败' }, { status: 500 })
  }
}
