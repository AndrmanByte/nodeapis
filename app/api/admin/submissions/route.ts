import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取所有提交记录
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = adminSupabase
      .from('provider_submissions')
      .select(`
        *,
        user:users(id, email, username)
      `)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get submissions error:', error)
    return NextResponse.json({ success: false, error: '获取提交记录失败' }, { status: 500 })
  }
}
