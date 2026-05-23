"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, Users, Eye, Clock, ArrowUp, ArrowDown, 
  Globe, Monitor, Smartphone, RefreshCw, Activity, ExternalLink
} from "lucide-react"

interface StatsData {
  pageviews: { value: number; change: number }
  visitors: { value: number; change: number }
  visits: { value: number; change: number }
  bounces: { value: number; change: number }
  totaltime: { value: number; change: number }
}

interface PageviewData {
  pageviews: { x: string; y: number }[]
  sessions: { x: string; y: number }[]
}

interface MetricItem {
  x: string
  y: number
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('7d')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [pageviews, setPageviews] = useState<PageviewData | null>(null)
  const [pages, setPages] = useState<MetricItem[]>([])
  const [referrers, setReferrers] = useState<MetricItem[]>([])
  const [browsers, setBrowsers] = useState<MetricItem[]>([])
  const [devices, setDevices] = useState<MetricItem[]>([])
  const [events, setEvents] = useState<MetricItem[]>([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [isDemo, setIsDemo] = useState(false)
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL
  const [iframeMode, setIframeMode] = useState(!!shareUrl)

  useEffect(() => {
    if (!iframeMode) loadAllData()
  }, [range, iframeMode])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadPageviews(),
        loadMetrics('url', setPages),
        loadMetrics('referrer', setReferrers),
        loadMetrics('browser', setBrowsers),
        loadMetrics('device', setDevices),
        loadEvents(),
        loadActiveUsers(),
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    const res = await fetch(`/api/admin/analytics?type=stats&range=${range}`)
    const data = await res.json()
    if (data.success || data.demo) {
      setStats(data.data)
      setIsDemo(data.demo || false)
    }
  }

  const loadPageviews = async () => {
    const res = await fetch(`/api/admin/analytics?type=pageviews&range=${range}`)
    const data = await res.json()
    if (data.success || data.demo) {
      setPageviews(data.data)
    }
  }

  const loadMetrics = async (metric: string, setter: (data: MetricItem[]) => void) => {
    const res = await fetch(`/api/admin/analytics?type=metrics&metric=${metric}&range=${range}`)
    const data = await res.json()
    if (data.success || data.demo) {
      setter(data.data || [])
    }
  }

  const loadEvents = async () => {
    const res = await fetch(`/api/admin/analytics?type=events&range=${range}`)
    const data = await res.json()
    if (data.success || data.demo) {
      setEvents(data.data || [])
    }
  }

  const loadActiveUsers = async () => {
    const res = await fetch(`/api/admin/analytics?type=active`)
    const data = await res.json()
    if (data.success || data.demo) {
      setActiveUsers(data.data?.x || 0)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const ChangeIndicator = ({ change }: { change: number }) => (
    <span className={`flex items-center text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(change)}%
    </span>
  )

  // 简单的柱状图组件
  const SimpleBarChart = ({ data, maxHeight = 100 }: { data: MetricItem[]; maxHeight?: number }) => {
    const maxValue = Math.max(...data.map(d => d.y), 1)
    return (
      <div className="space-y-2">
        {data.slice(0, 7).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20 sm:w-32 text-xs text-muted-foreground truncate" title={item.x}>
              {item.x || '(直接访问)'}
            </div>
            <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded transition-all"
                style={{ width: `${(item.y / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-12 sm:w-16 text-xs text-right font-medium">
              {formatNumber(item.y)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 页面浏览趋势图
  const TrendChart = ({ data }: { data: { x: string; y: number }[] }) => {
    if (!data || data.length === 0) return null
    const maxValue = Math.max(...data.map(d => d.y), 1)
    const chartHeight = 120
    
    return (
      <div className="flex items-end gap-1 h-[120px]">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-primary/60 rounded-t transition-all hover:bg-primary"
              style={{ height: `${(item.y / maxValue) * chartHeight}px` }}
              title={`${item.x}: ${item.y}`}
            />
            <span className="text-[10px] text-muted-foreground">
              {item.x.slice(5)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (iframeMode && shareUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">网站统计</h2>
          <Button variant="outline" size="sm" asChild>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              新窗口打开
            </a>
          </Button>
        </div>
        <div className="w-full h-[800px] rounded-lg overflow-hidden border border-border/50">
          <iframe 
            src={shareUrl} 
            className="w-full h-full"
            title="Umami Analytics"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部控制栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">网站统计</h2>
          {isDemo && (
            <Badge variant="secondary">演示数据</Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500" />
            <span>当前在线: <strong className="text-foreground">{activeUsers}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">最近24小时</SelectItem>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">页面浏览</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.pageviews?.value || 0)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Eye className="h-5 w-5 text-muted-foreground" />
                {stats?.pageviews?.change !== undefined && (
                  <ChangeIndicator change={stats.pageviews.change} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">独立访客</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.visitors?.value || 0)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Users className="h-5 w-5 text-muted-foreground" />
                {stats?.visitors?.change !== undefined && (
                  <ChangeIndicator change={stats.visitors.change} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">访问次数</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.visits?.value || 0)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                {stats?.visits?.change !== undefined && (
                  <ChangeIndicator change={stats.visits.change} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">跳出率</p>
                <p className="text-2xl font-bold">
                  {stats?.visits?.value ? ((stats?.bounces?.value || 0) / stats.visits.value * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Globe className="h-5 w-5 text-muted-foreground" />
                {stats?.bounces?.change !== undefined && (
                  <ChangeIndicator change={-stats.bounces.change} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">平均时长</p>
                <p className="text-2xl font-bold">
                  {stats?.visits?.value ? formatDuration(Math.floor((stats?.totaltime?.value || 0) / stats.visits.value)) : '0分0秒'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {stats?.totaltime?.change !== undefined && (
                  <ChangeIndicator change={stats.totaltime.change} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 页面浏览趋势 */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">页面浏览趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {pageviews?.pageviews && <TrendChart data={pageviews.pageviews} />}
        </CardContent>
      </Card>

      {/* 详细数据 Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="pages">热门页面</TabsTrigger>
          <TabsTrigger value="referrers">流量来源</TabsTrigger>
          <TabsTrigger value="browsers">浏览器</TabsTrigger>
          <TabsTrigger value="devices">设备类型</TabsTrigger>
          <TabsTrigger value="events">事件追踪</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">热门页面</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={pages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">流量来源</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={referrers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browsers">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                浏览器分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={browsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                设备类型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={devices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">事件追踪</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <SimpleBarChart data={events} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">暂无事件数据</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isDemo && (
        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
          当前显示的是演示数据。请在环境变量中配置 UMAMI_API_TOKEN 和 NEXT_PUBLIC_UMAMI_WEBSITE_ID 以获取真实数据。
        </div>
      )}
    </div>
  )
}
