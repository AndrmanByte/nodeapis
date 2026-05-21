import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取单个抽奖活动
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lottery_events')
      .select(`
        *,
        provider:providers(id, name, logo_url, website)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get lottery event error:', error)
    return NextResponse.json({ success: false, error: '获取抽奖活动失败' }, { status: 500 })
  }
}

// 更新抽奖活动
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()

    // 验证权限
    const { data: event } = await supabase
      .from('lottery_events')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (!event) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', event.provider_id)
      .single()

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (provider?.owner_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限修改此活动' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('lottery_events')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update lottery event error:', error)
    return NextResponse.json({ success: false, error: '更新抽奖活动失败' }, { status: 500 })
  }
}

// 删除抽奖活动
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    // 验证权限
    const { data: event } = await supabase
      .from('lottery_events')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (!event) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', event.provider_id)
      .single()

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (provider?.owner_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限删除此活动' }, { status: 403 })
    }

    const { error } = await supabase
      .from('lottery_events')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lottery event error:', error)
    return NextResponse.json({ success: false, error: '删除抽奖活动失败' }, { status: 500 })
  }
}
