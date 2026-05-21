import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - 获取所有激活的模型（公开）
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
