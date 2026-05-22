import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function verifyAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  return token.length > 0
}

// PUT - 管理员更新试用活动
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.provider_id !== undefined) updateData.provider_id = body.provider_id
    if (body.amount !== undefined) updateData.amount = body.amount.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.points_cost !== undefined) updateData.points_cost = body.points_cost || 0
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.highlight_order !== undefined) updateData.highlight_order = body.highlight_order
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at || null

    const { data, error } = await supabase
      .from('trial_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin update trial error:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

// DELETE - 管理员删除试用活动
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('trial_offers')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete trial error:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
