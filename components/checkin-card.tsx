"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Gift, Star, Crown, Trophy, Gem, Sprout, Leaf, TreeDeciduous, 
  Calendar, Coins, TrendingUp, Sparkles, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Level } from '@/lib/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  Sprout: <Sprout className="h-5 w-5" />,
  Leaf: <Leaf className="h-5 w-5" />,
  TreeDeciduous: <TreeDeciduous className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Gem: <Gem className="h-5 w-5" />,
}

const COLOR_MAP: Record<string, string> = {
  gray: 'text-gray-500 bg-gray-500/10',
  green: 'text-green-500 bg-green-500/10',
  blue: 'text-blue-500 bg-blue-500/10',
  purple: 'text-purple-500 bg-purple-500/10',
  yellow: 'text-yellow-500 bg-yellow-500/10',
  orange: 'text-orange-500 bg-orange-500/10',
  red: 'text-red-500 bg-red-500/10',
}

interface CheckinData {
  hasCheckedIn: boolean
  points: number
  level: number
  exp: number
  levelInfo: Level | null
  totalCheckins: number
  consecutiveCheckins: number
  todayReward: {
    base: number
    bonus: number
    total: number
    exp: number
  }
  monthRecords: string[]
}

export function CheckinCard() {
  const [data, setData] = useState<CheckinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)

  useEffect(() => {
    fetchData()
    fetchLevels()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/checkin')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch checkin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const res = await fetch('/api/levels')
      const json = await res.json()
      if (json.success) {
        setLevels(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch levels:', error)
    }
  }

  const handleCheckin = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/checkin', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setEarnedPoints(json.data.points_earned)
        setShowSuccess(true)
        toast.success(`签到成功！获得 ${json.data.points_earned} 积分`)
        setTimeout(() => setShowSuccess(false), 3000)
        fetchData()
      } else {
        toast.error(json.error)
      }
    } catch (error) {
      console.error('Checkin failed:', error)
      toast.error('签到失败')
    } finally {
      setChecking(false)
    }
  }

  // 计算到下一级的进度
  const getExpProgress = () => {
    if (!data || !levels.length) return 0
    const currentLevel = levels.find(l => l.level === data.level)
    const nextLevel = levels.find(l => l.level === data.level + 1)
    if (!currentLevel) return 0
    if (!nextLevel) return 100
    const currentExp = data.exp - currentLevel.min_exp
    const neededExp = nextLevel.min_exp - currentLevel.min_exp
    return Math.min(100, (currentExp / neededExp) * 100)
  }

  // 生成日历数据
  const getCalendarDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: { date: string; checked: boolean; isToday: boolean }[] = []

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        date,
        checked: data?.monthRecords?.includes(date) || false,
        isToday: d === today.getDate()
      })
    }
    return days
  }

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">请先登录查看签到信息</p>
          <Button className="mt-4" asChild>
            <a href="/login">前往登录</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const nextLevel = levels.find(l => l.level === data.level + 1)
  const currentLevelInfo = data.levelInfo

  return (
    <div className="space-y-4">
      {/* 成功动画 */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="animate-bounce rounded-xl bg-primary p-8 text-center text-primary-foreground shadow-2xl">
            <Sparkles className="mx-auto mb-4 h-16 w-16" />
            <p className="text-2xl font-bold">签到成功!</p>
            <p className="mt-2 text-lg">获得 {earnedPoints} 积分</p>
          </div>
        </div>
      )}

      {/* 用户信息卡片 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            我的等级
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                COLOR_MAP[currentLevelInfo?.color || 'gray']
              )}>
                {ICON_MAP[currentLevelInfo?.icon || 'Sprout']}
              </div>
              <div>
                <p className="font-semibold">Lv.{data.level} {currentLevelInfo?.name}</p>
                <p className="text-sm text-muted-foreground">
                  经验值: {data.exp} / {nextLevel?.min_exp || '已满级'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xl font-bold text-primary">
                <Coins className="h-5 w-5" />
                {data.points}
              </div>
              <p className="text-xs text-muted-foreground">当前积分</p>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>距离 Lv.{nextLevel.level} {nextLevel.name}</span>
                <span>{nextLevel.min_exp - data.exp} 经验</span>
              </div>
              <Progress value={getExpProgress()} className="h-2" />
            </div>
          )}

          <div className="flex gap-4 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="text-center">
              <p className="font-semibold">{data.totalCheckins}</p>
              <p className="text-xs text-muted-foreground">总签到</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{data.consecutiveCheckins}</p>
              <p className="text-xs text-muted-foreground">连续签到</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">+{currentLevelInfo?.checkin_bonus || 0}</p>
              <p className="text-xs text-muted-foreground">等级加成</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{currentLevelInfo?.lottery_discount || 0}%</p>
              <p className="text-xs text-muted-foreground">抽奖折扣</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 签到卡片 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            每日签到
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 签到按钮 */}
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
            <div>
              <p className="font-medium">
                {data.hasCheckedIn ? '今日已签到' : '今日可获得'}
              </p>
              {!data.hasCheckedIn && (
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{data.todayReward.base} 基础</Badge>
                  {data.todayReward.bonus > 0 && (
                    <Badge variant="default">+{data.todayReward.bonus} 加成</Badge>
                  )}
                  <Badge variant="outline">+{data.todayReward.exp} 经验</Badge>
                </div>
              )}
            </div>
            <Button 
              size="lg" 
              onClick={handleCheckin} 
              disabled={data.hasCheckedIn || checking}
              className={cn(
                "min-w-[100px]",
                data.hasCheckedIn && "bg-green-600 hover:bg-green-600"
              )}
            >
              {checking ? (
                '签到中...'
              ) : data.hasCheckedIn ? (
                <><Check className="mr-1 h-4 w-4" /> 已签到</>
              ) : (
                <><Gift className="mr-1 h-4 w-4" /> 签到</>
              )}
            </Button>
          </div>

          {/* 月度签到日历 */}
          <div>
            <p className="mb-2 text-sm font-medium">本月签到</p>
            <div className="grid grid-cols-7 gap-1">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="py-1 text-center text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
              {/* 填充月初空白 */}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {getCalendarDays().map(day => (
                <div
                  key={day.date}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-xs",
                    day.checked && "bg-primary text-primary-foreground",
                    day.isToday && !day.checked && "border border-primary text-primary",
                    !day.checked && !day.isToday && "text-muted-foreground"
                  )}
                >
                  {parseInt(day.date.split('-')[2])}
                </div>
              ))}
            </div>
          </div>

          {/* 连续签到奖励 */}
          <div>
            <p className="mb-2 text-sm font-medium">连续签到奖励</p>
            <div className="flex gap-2">
              {[
                { days: 7, bonus: 20 },
                { days: 14, bonus: 50 },
                { days: 30, bonus: 100 },
              ].map(reward => (
                <div
                  key={reward.days}
                  className={cn(
                    "flex-1 rounded-lg border p-2 text-center",
                    data.consecutiveCheckins >= reward.days
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <p className="text-xs text-muted-foreground">{reward.days}天</p>
                  <p className="font-semibold text-primary">+{reward.bonus}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
