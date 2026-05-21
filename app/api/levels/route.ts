import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 获取等级列表
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .order('level', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get levels error:', error)
    return NextResponse.json({ success: false, error: '获取等级列表失败' }, { status: 500 })
  }
}
