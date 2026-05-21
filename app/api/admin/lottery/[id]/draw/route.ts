import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - 开奖
export async function POST(
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

    // 获取活动信息
    const { data: event, error: eventError } = await adminSupabase
      .from('lottery_events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 })
    }

    if (event.status === 'drawn') {
      return NextResponse.json({ success: false, error: '该活动已开奖' }, { status: 400 })
    }

    // 获取所有参与者
    const { data: participants, error: partError } = await adminSupabase
      .from('lottery_participants')
      .select('id, user_id')
      .eq('event_id', id)

    if (partError) throw partError

    if (!participants || participants.length === 0) {
      return NextResponse.json({ success: false, error: '暂无参与者，无法开奖' }, { status: 400 })
    }

    // 随机选取中奖者
    const winnerCount = Math.min(event.winner_count, participants.length)
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const winners = shuffled.slice(0, winnerCount)
    const winnerIds = winners.map(w => w.id)
    const winnerUserIds = winners.map(w => w.user_id)

    // 标记中奖者
    for (const winnerId of winnerIds) {
      await adminSupabase
        .from('lottery_participants')
        .update({ is_winner: true })
        .eq('id', winnerId)
    }

    // 更新活动状态
    await adminSupabase
      .from('lottery_events')
      .update({ status: 'drawn' })
      .eq('id', id)

    // 给中奖者发通知
    for (const userId of winnerUserIds) {
      await adminSupabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '恭喜中奖！',
          content: `你在「${event.title}」抽奖活动中中奖了！奖品：${event.prize}，请联系管理员领取。`,
          type: 'lottery',
          link: `/lottery/${id}`
        })

      // 记录中奖积分（奖品价值积分）
      const { data: userData } = await adminSupabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single()

      if (userData) {
        const bonusPoints = 100 // 中奖奖励100积分
        const newPoints = userData.points + bonusPoints
        await adminSupabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', userId)

        await adminSupabase
          .from('point_records')
          .insert({
            user_id: userId,
            amount: bonusPoints,
            balance: newPoints,
            type: 'lottery_win',
            description: `「${event.title}」中奖奖励`,
            related_id: id
          })
      }
    }

    // 给未中奖者发通知
    const loserUserIds = participants
      .filter(p => !winnerUserIds.includes(p.user_id))
      .map(p => p.user_id)

    for (const userId of loserUserIds) {
      await adminSupabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '抽奖结果',
          content: `很遗憾，你在「${event.title}」抽奖活动中未中奖，下次再接再厉！`,
          type: 'lottery',
          link: `/lottery/${id}`
        })
    }

    return NextResponse.json({
      success: true,
      data: {
        winners: winnerUserIds,
        winner_count: winnerCount,
        total_participants: participants.length
      }
    })
  } catch (error) {
    console.error('Draw lottery error:', error)
    return NextResponse.json({ success: false, error: '开奖失败' }, { status: 500 })
  }
}
