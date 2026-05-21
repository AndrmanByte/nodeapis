import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// POST - 管理员登录
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码为必填项' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // 查找管理员
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 生成简单token（实际应该使用JWT）
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')

    // 设置cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7天
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: admin.id, 
        email: admin.email 
      } 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '登录失败' },
      { status: 500 }
    )
  }
}

// DELETE - 退出登录
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')
    
    return NextResponse.json({ success: true, message: '已退出登录' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '退出失败' },
      { status: 500 }
    )
  }
}

// GET - 检查登录状态
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    return NextResponse.json({ success: true, data: { authenticated: true } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '验证失败' },
      { status: 500 }
    )
  }
}
