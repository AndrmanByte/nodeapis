import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 验证管理员
async function verifyAdmin() {
  if (process.env.NODE_ENV === 'development') return true
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return !!session?.value
}

// 获取用户积分记录（管理员）
export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin()) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('point_records')
      .select(`
        *,
        user:users(id, username, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get point records error:', error)
    return NextResponse.json({ success: false, error: '获取积分记录失败' }, { status: 500 })
  }
}

// 调整用户积分（管理员）
export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin()) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { user_id, amount, description } = body

    if (!user_id || amount === undefined) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 })
    }

    // 获取用户当前积分
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points, username')
      .eq('id', user_id)
      .single()

    if (userError) throw userError

    const currentPoints = userData?.points || 0
    const newPoints = Math.max(0, currentPoints + amount)

    // 更新用户积分
    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', user_id)

    if (updateError) throw updateError

    // 创建积分记录
    const { error: recordError } = await supabase
      .from('point_records')
      .insert({
        user_id,
        amount,
        balance: newPoints,
        type: 'admin_adjust',
        description: description || `管理员${amount >= 0 ? '增加' : '扣除'} ${Math.abs(amount)} 积分`
      })

    if (recordError) throw recordError

    // 发送通知
    await supabase
      .from('notifications')
      .insert({
        user_id,
        title: '积分变动通知',
        content: `您的积分${amount >= 0 ? '增加' : '减少'}了 ${Math.abs(amount)} 点，当前积分 ${newPoints}`,
        type: 'points'
      })

    return NextResponse.json({
      success: true,
      data: {
        user_id,
        previous_points: currentPoints,
        adjustment: amount,
        new_points: newPoints
      }
    })
  } catch (error) {
    console.error('Adjust points error:', error)
    return NextResponse.json({ success: false, error: '积分调整失败' }, { status: 500 })
  }
}
