import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ success: false, error: '获取用户失败' }, { status: 500 })
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { username, role, is_active } = body

    const { data, error } = await adminSupabase
      .from('users')
      .update({ username, role, is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: '更新用户失败' }, { status: 500 })
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: '删除用户失败' }, { status: 500 })
  }
}
