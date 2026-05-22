import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CHECKIN_REWARDS } from '@/lib/types'

// 获取签到状态
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points, level, exp, total_checkins, consecutive_checkins, last_checkin_date')
      .eq('id', user.id)
      .single()

    if (userError) throw userError

    // 获取等级信息
    const { data: levelInfo } = await supabase
      .from('levels')
      .select('*')
      .eq('level', userData?.level || 1)
      .single()

    // 检查今天是否已签到（使用本地日期避免时区问题）
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const lastCheckin = userData?.last_checkin_date ? String(userData.last_checkin_date).slice(0, 10) : null
    const hasCheckedIn = lastCheckin === today

    // 计算今日可获得积分
    let basePoints = CHECKIN_REWARDS.base
    let bonusPoints = 0
    let consecutiveDays = userData?.consecutive_checkins || 0

    // 如果昨天签到了，连续天数+1
    if (userData?.last_checkin_date) {
      const lastDateStr = String(userData.last_checkin_date).slice(0, 10)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      if (lastDateStr === yesterdayStr) {
        consecutiveDays = userData.consecutive_checkins + 1
      } else if (lastDateStr !== today) {
        consecutiveDays = 1
      }
    } else {
      consecutiveDays = 1
    }

    // 等级加成
    if (levelInfo?.checkin_bonus) {
      bonusPoints += levelInfo.checkin_bonus
    }

    // 连续签到加成
    for (const reward of CHECKIN_REWARDS.consecutive) {
      if (consecutiveDays >= reward.days) {
        bonusPoints = reward.bonus
      }
    }

    // 获取本月签到记录
    const firstDay = new Date()
    firstDay.setDate(1)
    const { data: monthRecords } = await supabase
      .from('checkin_records')
      .select('checkin_date')
      .eq('user_id', user.id)
      .gte('checkin_date', firstDay.toISOString().split('T')[0])
      .order('checkin_date', { ascending: true })

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedIn,
        points: userData?.points || 0,
        level: userData?.level || 1,
        exp: userData?.exp || 0,
        levelInfo,
        totalCheckins: userData?.total_checkins || 0,
        consecutiveCheckins: hasCheckedIn ? userData?.consecutive_checkins : consecutiveDays,
        todayReward: {
          base: basePoints,
          bonus: bonusPoints,
          total: basePoints + bonusPoints,
          exp: CHECKIN_REWARDS.exp
        },
        monthRecords: monthRecords?.map(r => r.checkin_date) || []
      }
    })
  } catch (error) {
    console.error('Get checkin status error:', error)
    return NextResponse.json({ success: false, error: '获取签到状态失败' }, { status: 500 })
  }
}

// 签到
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError && userError.code !== 'PGRST116') throw userError

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

    // 检查今天是否已签到
    const lastCheckin = userData?.last_checkin_date ? String(userData.last_checkin_date).slice(0, 10) : null
    if (lastCheckin === today) {
      return NextResponse.json({ success: false, error: '今天已经签到过了' }, { status: 400 })
    }

    // 计算连续天数
    let consecutiveDays = 1
    if (userData?.last_checkin_date) {
      const lastDateStr = String(userData.last_checkin_date).slice(0, 10)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      if (lastDateStr === yesterdayStr) {
        consecutiveDays = (userData.consecutive_checkins || 0) + 1
      }
    }

    // 获取等级信息
    const { data: levelInfo } = await supabase
      .from('levels')
      .select('checkin_bonus')
      .eq('level', userData?.level || 1)
      .single()

    // 计算积分
    let basePoints = CHECKIN_REWARDS.base
    let bonusPoints = levelInfo?.checkin_bonus || 0

    // 连续签到加成
    for (const reward of CHECKIN_REWARDS.consecutive) {
      if (consecutiveDays >= reward.days) {
        bonusPoints = Math.max(bonusPoints, reward.bonus)
      }
    }

    const totalPoints = basePoints + bonusPoints
    const newPoints = (userData?.points || 0) + totalPoints
    const newExp = (userData?.exp || 0) + CHECKIN_REWARDS.exp

    // 检查是否自动升级
    let newLevel = userData?.level || 1
    let leveledUp = false
    const { data: allLevels } = await supabase
      .from('levels')
      .select('level, min_exp')
      .order('level', { ascending: false })

    if (allLevels) {
      for (const lv of allLevels) {
        if (newExp >= lv.min_exp && lv.level > newLevel) {
          newLevel = lv.level
          leveledUp = true
          break
        }
      }
    }

    // 更新用户数据
    const updateData: Record<string, any> = {
      points: newPoints,
      exp: newExp,
      total_checkins: (userData?.total_checkins || 0) + 1,
      consecutive_checkins: consecutiveDays,
      last_checkin_date: today
    }
    if (leveledUp) {
      updateData.level = newLevel
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) throw updateError

    // 创建签到记录（先检查是否已存在）
    const { data: existingRecord } = await supabase
      .from('checkin_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle()

    if (!existingRecord) {
      const { error: recordError } = await supabase
        .from('checkin_records')
        .insert({
          user_id: user.id,
          checkin_date: today,
          points_earned: totalPoints,
          is_consecutive: consecutiveDays > 1,
          consecutive_days: consecutiveDays
        })
      if (recordError) throw recordError
    }

    // 创建积分记录
    const { error: pointError } = await supabase
      .from('point_records')
      .insert({
        user_id: user.id,
        amount: totalPoints,
        balance: newPoints,
        type: 'checkin',
        description: `签到获得 ${totalPoints} 积分${bonusPoints > 0 ? `（含加成 ${bonusPoints}）` : ''}`
      })

    if (pointError) throw pointError

    // 发送通知
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: '签到成功',
        content: `获得 ${totalPoints} 积分和 ${CHECKIN_REWARDS.exp} 经验！连续签到 ${consecutiveDays} 天`,
        type: 'points'
      })

    // 升级通知
    if (leveledUp) {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: '恭喜升级！',
          content: `你已升级到 Lv.${newLevel}，享受更多特权！`,
          type: 'system'
        })
    }

    return NextResponse.json({
      success: true,
      data: {
        points_earned: totalPoints,
        exp_earned: CHECKIN_REWARDS.exp,
        new_points: newPoints,
        new_exp: newExp,
        new_level: newLevel,
        leveled_up: leveledUp,
        consecutive_days: consecutiveDays
      }
    })
  } catch (error) {
    console.error('Checkin error:', error)
    return NextResponse.json({ success: false, error: '签到失败' }, { status: 500 })
  }
}
