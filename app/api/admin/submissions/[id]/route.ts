import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 审核提交
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
    const { status, review_notes } = body

    // 获取提交信息
    const { data: submission, error: fetchError } = await adminSupabase
      .from('provider_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ success: false, error: '提交不存在' }, { status: 404 })
    }

    // 更新提交状态
    const { data, error } = await adminSupabase
      .from('provider_submissions')
      .update({
        status,
        review_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 如果通过审核，创建店铺并更新用户角色
    if (status === 'approved') {
      // 创建店铺
      const { data: newProvider, error: providerError } = await adminSupabase
        .from('providers')
        .insert({
          owner_id: submission.user_id,
          name: submission.name,
          description: submission.description || '',
          website: submission.website,
          api_url: submission.api_url || '',
          logo_url: submission.logo_url || '',
          screenshot_url: submission.screenshot_url || '',
          supported_models: submission.supported_models || [],
          supported_vendors: submission.supported_vendors || [],
          pricing: submission.pricing || [],
          features: submission.features || [],
          register_type: submission.register_type || '',
          contact: submission.contact || '',
          min_deposit: submission.min_deposit || '',
          payment_methods: submission.payment_methods || [],
          free_trial: submission.free_trial || false,
          advantages: submission.advantages || [],
          is_verified: false,
          is_featured: false
        })
        .select()
        .single()

      if (providerError) throw providerError

      // 更新用户角色为商家
      if (submission.user_id) {
        await adminSupabase
          .from('users')
          .update({ role: 'merchant' })
          .eq('id', submission.user_id)
      }

      // 发送通知
      if (submission.user_id) {
        await adminSupabase
          .from('notifications')
          .insert({
            user_id: submission.user_id,
            title: '提交审核通过',
            content: `恭喜！您提交的中转站「${submission.name}」已通过审核，您已成为商家。`,
            type: 'submission',
            link: '/profile'
          })
      }
    } else if (status === 'rejected') {
      // 发送拒绝通知
      if (submission.user_id) {
        await adminSupabase
          .from('notifications')
          .insert({
            user_id: submission.user_id,
            title: '提交审核未通过',
            content: `您提交的中转站「${submission.name}」未通过审核。${review_notes ? `原因: ${review_notes}` : ''}`,
            type: 'submission',
            link: '/profile'
          })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json({ success: false, error: '审核失败' }, { status: 500 })
  }
}

// 删除提交记录
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
      .from('provider_submissions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete submission error:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
