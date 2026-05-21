import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get('placement')

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (placement) {
      query = query.eq('placement', placement)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Filter by time range (only filter if both start and end are set and clearly expired)
    const filtered = (data || []).filter((ad) => {
      // Only hide if end_time is set and has passed
      if (ad.end_time && new Date(ad.end_time) < new Date(now)) return false
      return true
    })

    return NextResponse.json({ success: true, data: filtered })
  } catch {
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 })
  }
}
