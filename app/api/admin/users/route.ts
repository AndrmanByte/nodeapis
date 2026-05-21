import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取所有用户
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    let query = adminSupabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ success: false, error: '获取用户失败' }, { status: 500 })
  }
}
