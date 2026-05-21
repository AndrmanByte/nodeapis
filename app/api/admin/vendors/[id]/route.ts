import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function verifyAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  return token.length > 0
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vendors')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

    const { id } = await params
    const supabase = createAdminClient()
    const { error } = await supabase.from('vendors').delete().eq('id', id)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: '删除成功' })
  } catch {
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
