import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const SUBMIT_REWARD_POINTS = 50

// POST - 提交新的中转站申请
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, short_description, description, website, api_url, contact_email, contact, supported_models, supported_vendors, pricing, features, logo_url, screenshot_url, register_type, min_deposit, payment_methods, free_trial, advantages } = body

    if (!name || !website) {
      return NextResponse.json(
        { success: false, error: '名称和网站地址为必填项' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 获取当前用户（必须登录）
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录后再提交' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('provider_submissions')
      .insert({
        user_id: user.id,
        name,
        short_description: short_description || '',
        description,
        website,
        api_url: api_url || '',
        contact_email,
        contact: contact || '',
        supported_models: supported_models || [],
        supported_vendors: supported_vendors || [],
        pricing: pricing || [],
        features: features || [],
        logo_url: logo_url || '',
        screenshot_url: screenshot_url || '',
        register_type: register_type || '',
        min_deposit: min_deposit || '',
        payment_methods: payment_methods || [],
        free_trial: free_trial || false,
        advantages: advantages || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 奖励提交者积分
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single()

      if (userData) {
        const newPoints = userData.points + SUBMIT_REWARD_POINTS
        await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', user.id)

        await supabase
          .from('point_records')
          .insert({
            user_id: user.id,
            amount: SUBMIT_REWARD_POINTS,
            balance: newPoints,
            type: 'submit_provider',
            description: `提交中转站「${name}」获得 ${SUBMIT_REWARD_POINTS} 积分`,
            related_id: data.id
          })

        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: '提交奖励',
            content: `提交中转站「${name}」成功，获得 ${SUBMIT_REWARD_POINTS} 积分奖励！`,
            type: 'points'
          })
      }
    } catch (rewardError) {
      console.error('Award submit points error:', rewardError)
      // 不影响提交成功
    }

    return NextResponse.json({
      success: true,
      data,
      message: '提交成功，我们会尽快审核'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '提交失败' },
      { status: 500 }
    )
  }
}

// GET - 获取所有提交申请（管理员用）
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('provider_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    )
  }
}
