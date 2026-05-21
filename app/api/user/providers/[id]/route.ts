import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const { name, description, website, logo_url, status, features, supported_models, pricing } = body

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
        pricing
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
