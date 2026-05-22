import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - 用户领取兑换码（原子操作防超卖）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ trialId: string }> }
) {
  try {
    const { trialId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // 检查活动是否有效
    const now = new Date().toISOString()
    const { data: offer } = await adminSupabase
      .from('trial_offers')
      .select('id, is_active, expires_at, points_cost')
      .eq('id', trialId)
      .eq('is_active', true)
      .single()

    if (!offer) {
      return NextResponse.json({ success: false, error: '活动不存在或已结束' }, { status: 404 })
    }

    if (offer.expires_at && offer.expires_at < now) {
      return NextResponse.json({ success: false, error: '活动已过期' }, { status: 400 })
    }

    // 检查用户是否已领取过该活动的码
    const { data: alreadyClaimed } = await adminSupabase
      .from('trial_codes')
      .select('id')
      .eq('trial_offer_id', trialId)
      .eq('claimed_by', user.id)
      .not('claimed_at', 'is', null)
      .limit(1)
      .single()

    if (alreadyClaimed) {
      return NextResponse.json({ success: false, error: '你已经领取过该活动的兑换码' }, { status: 400 })
    }

    // 如果需要积分，检查并扣除
    const pointsCost = offer.points_cost || 0
    if (pointsCost > 0) {
      const { data: userData } = await adminSupabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single()

      if (!userData || userData.points < pointsCost) {
        return NextResponse.json({
          success: false,
          error: `积分不足，需要 ${pointsCost} 积分，当前 ${userData?.points || 0} 积分`,
        }, { status: 400 })
      }

      // 扣除积分
      const { error: deductError } = await adminSupabase
        .from('users')
        .update({ points: userData.points - pointsCost })
        .eq('id', user.id)

      if (deductError) {
        console.error('Deduct points error:', deductError)
        return NextResponse.json({ success: false, error: '扣除积分失败' }, { status: 500 })
      }

      // 记录积分变动
      await adminSupabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          amount: -pointsCost,
          type: 'trial_claim',
          description: `领取试用兑换码消耗积分`,
        })
    }

    // 原子操作：通过 RPC 调用数据库函数领取码
    // 使用 FOR UPDATE SKIP LOCKED 防止并发冲突
    const { data: claimedCode, error: claimError } = await adminSupabase
      .rpc('claim_trial_code', {
        p_trial_offer_id: trialId,
        p_user_id: user.id,
      })

    if (claimError) {
      console.error('Claim RPC error:', claimError)
      // 如果领取码失败且已扣积分，需要回滚积分
      if (pointsCost > 0) {
        const { data: currentUser } = await adminSupabase
          .from('users')
          .select('points')
          .eq('id', user.id)
          .single()
        if (currentUser) {
          await adminSupabase
            .from('users')
            .update({ points: currentUser.points + pointsCost })
            .eq('id', user.id)
        }
      }
      return NextResponse.json({ success: false, error: '领取失败，请重试' }, { status: 500 })
    }

    if (!claimedCode || claimedCode.length === 0) {
      // 码已领完，回滚积分
      if (pointsCost > 0) {
        const { data: currentUser } = await adminSupabase
          .from('users')
          .select('points')
          .eq('id', user.id)
          .single()
        if (currentUser) {
          await adminSupabase
            .from('users')
            .update({ points: currentUser.points + pointsCost })
            .eq('id', user.id)
        }
      }
      return NextResponse.json({ success: false, error: '兑换码已被领完' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        code: claimedCode[0].code,
        points_deducted: pointsCost,
      },
    })
  } catch (error) {
    console.error('Claim trial code error:', error)
    return NextResponse.json({ success: false, error: '领取失败' }, { status: 500 })
  }
}
