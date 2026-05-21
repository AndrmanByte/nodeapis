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

export async function GET() {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

    const body = await request.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vendors')
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}
