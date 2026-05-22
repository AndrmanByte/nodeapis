import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET - 获取中转站评论列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('provider_comments')
      .select(`
        *,
        user:users(id, username, avatar_url, level)
      `)
      .eq('provider_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const comments = data || []
    const count = comments.length
    const avgRating = count > 0
      ? Math.round(comments.reduce((sum, c) => sum + c.rating, 0) / count * 10) / 10
      : 0

    return NextResponse.json({
      success: true,
      data: comments,
      stats: { count, avg_rating: avgRating }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - 发表评论
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const { id: providerId } = await params
    const body = await request.json()
    const { content, images = [], rating } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: '评论内容不能为空' }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: '请选择评分' }, { status: 400 })
    }

    if (images.length > 3) {
      return NextResponse.json({ success: false, error: '最多上传3张图片' }, { status: 400 })
    }

    // 频率限制：同一用户对同一中转站 7 天内只能评论一次
    const adminSupabase = createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentComment } = await adminSupabase
      .from('provider_comments')
      .select('id')
      .eq('provider_id', providerId)
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo)
      .limit(1)
      .maybeSingle()

    if (recentComment) {
      return NextResponse.json({ success: false, error: '每周只能评价一次，请稍后再试' }, { status: 429 })
    }

    const { data, error } = await adminSupabase
      .from('provider_comments')
      .insert({
        provider_id: providerId,
        user_id: user.id,
        content: content.trim(),
        images,
        rating,
      })
      .select(`
        *,
        user:users(id, username, avatar_url, level)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
