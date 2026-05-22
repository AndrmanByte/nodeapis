import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - 获取所有评论（评论广场）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = createAdminClient()

    const { data, error, count } = await supabase
      .from('provider_comments')
      .select(`
        *,
        user:users(id, username, avatar_url, level),
        provider:providers(id, name, logo_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
