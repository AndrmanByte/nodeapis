import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 参与抽奖
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    // 获取活动信息
    const { data: event, error: eventError } = await supabase
      .from('lottery_events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 })
    }

    // 检查活动状态
    if (event.status !== 'active') {
      return NextResponse.json({ success: false, error: '活动未开始或已结束' }, { status: 400 })
    }

    // 检查时间
    const now = new Date()
    if (now < new Date(event.start_time)) {
      return NextResponse.json({ success: false, error: '活动尚未开始' }, { status: 400 })
    }
    if (now > new Date(event.end_time)) {
      return NextResponse.json({ success: false, error: '活动已结束' }, { status: 400 })
    }

    // 检查参与人数
    if (event.current_participants >= event.max_participants) {
      return NextResponse.json({ success: false, error: '参与人数已满' }, { status: 400 })
    }

    // 检查是否已参与
    const { data: existing } = await supabase
      .from('lottery_participants')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: '您已参与过此活动' }, { status: 400 })
    }

    // 获取用户信息和等级
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points, level')
      .eq('id', user.id)
      .single()

    if (userError && userError.code !== 'PGRST116') throw userError

    const userPoints = userData?.points || 0
    const userLevel = userData?.level || 1

    // 获取等级折扣
    const { data: levelInfo } = await supabase
      .from('levels')
      .select('lottery_discount')
      .eq('level', userLevel)
      .single()

    const discount = levelInfo?.lottery_discount || 0
    const pointsCost = event.points_cost
    const actualCost = Math.floor(pointsCost * (100 - discount) / 100)

    // 检查积分是否足够
    if (actualCost > 0 && userPoints < actualCost) {
      return NextResponse.json({ 
        success: false, 
        error: `积分不足，需要 ${actualCost} 积分（原价 ${pointsCost}，等级折扣 ${discount}%），当前积分 ${userPoints}` 
      }, { status: 400 })
    }

    // 如果用户不存在，创建用户
    if (!userData) {
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url
        })
      if (createError) throw createError
    }

    // 扣除积分
    const newPoints = userPoints - actualCost
    if (actualCost > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', user.id)

      if (updateError) throw updateError

      // 创建积分记录
      await supabase
        .from('point_records')
        .insert({
          user_id: user.id,
          amount: -actualCost,
          balance: newPoints,
          type: 'lottery',
          description: `参与抽奖「${event.title}」消耗 ${actualCost} 积分`,
          related_id: id
        })
    }

    // 创建参与记录
    const { error: participateError } = await supabase
      .from('lottery_participants')
      .insert({
        event_id: id,
        user_id: user.id,
        points_spent: actualCost
      })

    if (participateError) throw participateError

    // 更新参与人数
    await supabase
      .from('lottery_events')
      .update({ current_participants: event.current_participants + 1 })
      .eq('id', id)

    // 发送通知
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: '参与抽奖成功',
        content: actualCost > 0 
          ? `您已成功参与「${event.title}」抽奖活动，消耗 ${actualCost} 积分，祝您好运！`
          : `您已成功参与「${event.title}」抽奖活动，祝您好运！`,
        type: 'lottery',
        link: `/lottery/${id}`
      })

    return NextResponse.json({ 
      success: true, 
      message: '参与成功',
      data: {
        points_spent: actualCost,
        discount_applied: discount,
        remaining_points: newPoints
      }
    })
  } catch (error) {
    console.error('Participate lottery error:', error)
    return NextResponse.json({ success: false, error: '参与失败' }, { status: 500 })
  }
}

// 获取活动参与者列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lottery_participants')
      .select(`
        *,
        user:users(id, username, avatar_url, level)
      `)
      .eq('event_id', id)
      .order('participated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json({ success: false, error: '获取参与者列表失败' }, { status: 500 })
  }
}
