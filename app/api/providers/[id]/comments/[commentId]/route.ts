import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// DELETE - 删除评论（只能删自己的）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const { commentId } = await params
    const adminSupabase = createAdminClient()

    // 验证评论归属
    const { data: comment } = await adminSupabase
      .from('provider_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return NextResponse.json({ success: false, error: '评论不存在' }, { status: 404 })
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '只能删除自己的评论' }, { status: 403 })
    }

    const { error } = await adminSupabase
      .from('provider_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
