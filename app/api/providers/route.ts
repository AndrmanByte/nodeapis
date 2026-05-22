import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - 获取所有中转站
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const supabase = createAdminClient()
    
    let query = supabase
      .from('providers')
      .select('*')
      .neq('is_published', false)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    )
  }
}
