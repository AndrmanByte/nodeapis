import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 获取用户自己的建议列表
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 提交新建议
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { title, content, category = 'general' } = body

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: '标题不能超过200字' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: '内容不能超过2000字' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user?.id || null,
        title,
        content,
        category,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
