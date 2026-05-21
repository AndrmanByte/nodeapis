import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 获取用户的店铺列表
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: providers })
  } catch (error) {
    console.error('Get user providers error:', error)
    return NextResponse.json({ success: false, error: '获取店铺列表失败' }, { status: 500 })
  }
}
