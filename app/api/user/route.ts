import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取当前用户信息
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // 如果用户不存在，创建新用户
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.name || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url,
          auth_provider: authUser.app_metadata?.provider || 'email',
          role: 'user'
        })
        .select()
        .single()

      if (createError) throw createError
      return NextResponse.json({ success: true, data: newUser })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ success: false, error: '获取用户信息失败' }, { status: 500 })
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { username, avatar_url } = body

    const { data: user, error } = await supabase
      .from('users')
      .update({ username, avatar_url })
      .eq('id', authUser.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: '更新用户信息失败' }, { status: 500 })
  }
}
