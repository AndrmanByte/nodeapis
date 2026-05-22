import { NextRequest, NextResponse } from 'next/server'

// Umami API 数据获取
// 需要配置: UMAMI_API_URL, UMAMI_API_TOKEN, UMAMI_WEBSITE_ID

const UMAMI_API_URL = process.env.UMAMI_API_URL || 'https://cloud.umami.is/api'
const UMAMI_API_TOKEN = process.env.UMAMI_API_TOKEN
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

async function umamiRequest(endpoint: string, params?: Record<string, string>) {
  if (!UMAMI_API_TOKEN || !UMAMI_WEBSITE_ID) {
    throw new Error('Umami API 未配置')
  }

  const url = new URL(`${UMAMI_API_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${UMAMI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Umami API 错误: ${res.status}`)
  }

  return res.json()
}

// 获取时间范围参数
function getTimeRange(range: string) {
  const now = Date.now()
  const ranges: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  }
  const duration = ranges[range] || ranges['7d']
  return {
    startAt: String(now - duration),
    endAt: String(now),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const range = searchParams.get('range') || '7d'
    
    const { startAt, endAt } = getTimeRange(range)
    const websiteId = UMAMI_WEBSITE_ID

    let data: any = {}

    switch (type) {
      case 'stats':
        // 获取基础统计
        data = await umamiRequest(`/websites/${websiteId}/stats`, { startAt, endAt })
        break
      
      case 'pageviews':
        // 获取页面浏览量趋势
        data = await umamiRequest(`/websites/${websiteId}/pageviews`, { 
          startAt, 
          endAt, 
          unit: range === '24h' ? 'hour' : 'day' 
        })
        break
      
      case 'metrics':
        // 获取指标数据 (页面、来源、浏览器等)
        const metricType = searchParams.get('metric') || 'url'
        data = await umamiRequest(`/websites/${websiteId}/metrics`, { 
          startAt, 
          endAt, 
          type: metricType,
          limit: '10'
        })
        break
      
      case 'events':
        // 获取事件数据
        data = await umamiRequest(`/websites/${websiteId}/events`, { startAt, endAt })
        break
      
      case 'active':
        // 获取实时在线用户
        data = await umamiRequest(`/websites/${websiteId}/active`)
        break
      
      default:
        data = { error: '未知的数据类型' }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Umami API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch analytics',
      // 返回模拟数据用于演示
      demo: true,
      data: getDemoData(new URL(request.url).searchParams.get('type') || 'stats')
    })
  }
}

// 当 Umami 未配置时返回演示数据
function getDemoData(type: string) {
  const now = Date.now()
  
  switch (type) {
    case 'stats':
      return {
        pageviews: { value: 12580, change: 12 },
        visitors: { value: 3420, change: 8 },
        visits: { value: 4850, change: 15 },
        bounces: { value: 1230, change: -5 },
        totaltime: { value: 285600, change: 10 },
      }
    
    case 'pageviews':
      return {
        pageviews: Array.from({ length: 7 }, (_, i) => ({
          x: new Date(now - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          y: Math.floor(Math.random() * 500) + 200
        })),
        sessions: Array.from({ length: 7 }, (_, i) => ({
          x: new Date(now - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          y: Math.floor(Math.random() * 200) + 80
        }))
      }
    
    case 'metrics':
      return [
        { x: '/', y: 3250 },
        { x: '/providers', y: 1820 },
        { x: '/checkin', y: 1450 },
        { x: '/lottery', y: 980 },
        { x: '/profile', y: 750 },
        { x: '/login', y: 620 },
        { x: '/admin', y: 180 },
      ]
    
    case 'events':
      return [
        { x: 'checkin', y: 856 },
        { x: 'lottery_participate', y: 423 },
        { x: 'provider_view', y: 1250 },
        { x: 'search', y: 680 },
        { x: 'suggestion_submit', y: 45 },
      ]
    
    case 'active':
      return { x: Math.floor(Math.random() * 20) + 5 }
    
    default:
      return {}
  }
}
