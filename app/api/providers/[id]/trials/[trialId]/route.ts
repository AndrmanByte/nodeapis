import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PUT - 更新试用活动
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trialId: string }> }
) {
  try {
    const { id, trialId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!provider || provider.owner_id !== user.id) {
      return NextResponse.json({ success: false, error: '无权限操作此店铺' }, { status: 403 })
    }

    const { data: trial } = await supabase
      .from('trial_offers')
      .select('id')
      .eq('id', trialId)
      .eq('provider_id', id)
      .single()

    if (!trial) {
      return NextResponse.json({ success: false, error: '试用活动不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, description, is_active, highlight_order, expires_at } = body

    const updateData: Record<string, unknown> = {}
    if (amount !== undefined) updateData.amount = amount.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (is_active !== undefined) updateData.is_active = is_active
    if (highlight_order !== undefined) updateData.highlight_order = highlight_order
    if (expires_at !== undefined) updateData.expires_at = expires_at || null

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('trial_offers')
      .update(updateData)
      .eq('id', trialId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update trial offer error:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

// DELETE - 删除试用活动
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; trialId: string }> }
) {
  try {
    const { id, trialId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!provider || provider.owner_id !== user.id) {
      return NextResponse.json({ success: false, error: '无权限操作此店铺' }, { status: 403 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('trial_offers')
      .delete()
      .eq('id', trialId)
      .eq('provider_id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete trial offer error:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
