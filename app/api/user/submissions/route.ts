import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 获取用户的提交记录
export async function GET() {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: submissions, error } = await adminSupabase
      .from('provider_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('Get user submissions error:', error)
    return NextResponse.json({ success: false, error: '获取提交记录失败' }, { status: 500 })
  }
}
