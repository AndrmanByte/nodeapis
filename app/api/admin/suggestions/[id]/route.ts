import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// 更新建议状态和回复
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()
    const { status, admin_reply } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (admin_reply !== undefined) {
      updateData.admin_reply = admin_reply
      updateData.replied_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 如果有回复且有用户ID，发送通知
    if (admin_reply && data.user_id) {
      await supabase.from('notifications').insert({
        user_id: data.user_id,
        title: '您的建议有新回复',
        content: `您提交的建议"${data.title}"已收到管理员回复`,
        type: 'system',
        link: '/profile?tab=suggestions'
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 删除建议
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
