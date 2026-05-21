import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取用户通知
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ success: false, error: '获取通知失败' }, { status: 500 })
  }
}

// 创建通知 (管理员)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    // 验证是否是管理员
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!admin) {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, title, content, type, link } = body

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id || null, // null 表示发送给所有人
        title,
        content,
        type: type || 'system',
        link
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ success: false, error: '创建通知失败' }, { status: 500 })
  }
}
