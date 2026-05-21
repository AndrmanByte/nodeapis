import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取公告列表
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    let query = adminSupabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    // 非管理员只能看到激活的公告
    if (!all) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error

    // 过滤过期的公告
    const now = new Date()
    const filteredData = all ? data : data?.filter(announcement => {
      if (!announcement.end_time) return true
      return new Date(announcement.end_time) > now
    })

    return NextResponse.json({ success: true, data: filteredData })
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ success: false, error: '获取公告失败' }, { status: 500 })
  }
}

// 创建公告 (管理员)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    if (process.env.NODE_ENV !== 'development') {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
      }

      // 验证管理员
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
    const { title, content, type, is_pinned, is_active, start_time, end_time } = body

    const { data, error } = await adminSupabase
      .from('announcements')
      .insert({
        title,
        content,
        type: type || 'info',
        is_pinned: is_pinned || false,
        is_active: is_active !== false,
        start_time: start_time || new Date().toISOString(),
        end_time
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ success: false, error: '创建公告失败' }, { status: 500 })
  }
}
