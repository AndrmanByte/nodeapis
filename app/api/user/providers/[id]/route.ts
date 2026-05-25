import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 获取自己的店铺详情
export async function GET(
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

    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (error || !provider) {
      return NextResponse.json({ success: false, error: '店铺不存在或无权限访问' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: provider })
  } catch (error) {
    console.error('Get provider error:', error)
    return NextResponse.json({ success: false, error: '获取店铺失败' }, { status: 500 })
  }
}

// 更新自己的店铺
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

    // 验证是否是店铺所有者
    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!provider || provider.owner_id !== user.id) {
      return NextResponse.json({ success: false, error: '无权限操作此店铺' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name, description, website, logo_url, status, features,
      supported_models, pricing, short_description, screenshot_url,
      api_url, contact_email, contact, register_type, min_deposit,
      payment_methods, advantages, supported_vendors
    } = body

    const { data, error } = await supabase
      .from('providers')
      .update({
        name,
        description,
        website,
        logo_url,
        status,
        features,
        supported_models,
        pricing,
        short_description,
        screenshot_url,
        api_url,
        contact_email,
        contact,
        register_type,
        min_deposit,
        payment_methods,
        advantages,
        supported_vendors
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update provider error:', error)
    return NextResponse.json({ success: false, error: '更新店铺失败' }, { status: 500 })
  }
}

// 删除自己的店铺
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

    // 验证是否是店铺所有者
    const { data: provider } = await supabase
      .from('providers')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!provider || provider.owner_id !== user.id) {
      return NextResponse.json({ success: false, error: '无权限操作此店铺' }, { status: 403 })
    }

    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 更新用户角色为普通用户（如果没有其他店铺）
    const { data: otherProviders } = await supabase
      .from('providers')
      .select('id')
      .eq('owner_id', user.id)

    if (!otherProviders || otherProviders.length === 0) {
      await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete provider error:', error)
    return NextResponse.json({ success: false, error: '删除店铺失败' }, { status: 500 })
  }
}
