import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取抽奖活动列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const providerId = searchParams.get('provider_id')

    let query = supabase
      .from('lottery_events')
      .select(`
        *,
        provider:providers(id, name, logo_url)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    } else {
      // 默认只返回进行中和已结束的活动
      query = query.in('status', ['active', 'ended'])
    }

    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get lottery events error:', error)
    return NextResponse.json({ success: false, error: '获取抽奖活动失败' }, { status: 500 })
  }
}

// 创建抽奖活动 (需要管理员或商家权限)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const {
      provider_id,
      title,
      description,
      prize_name,
      prize_description,
      prize_image,
      prize_count,
      max_participants,
      start_time,
      end_time,
      status
    } = body

    // 验证用户是否有权限（是店铺所有者或管理员）
    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', provider_id)
      .single()

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ success: false, error: '店铺不存在' }, { status: 404 })
    }

    if (provider.owner_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限创建此活动' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('lottery_events')
      .insert({
        provider_id,
        title,
        description,
        prize_name,
        prize_description,
        prize_image,
        prize_count: prize_count || 1,
        max_participants: max_participants || 100,
        start_time,
        end_time,
        status: status || 'draft'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create lottery event error:', error)
    return NextResponse.json({ success: false, error: '创建抽奖活动失败' }, { status: 500 })
  }
}
