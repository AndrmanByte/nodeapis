"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { LotteryEvent, LotteryParticipant, User, Level } from '@/lib/types'
import { Gift, Users, Clock, Store, Trophy, Check, Coins, Sparkles } from "lucide-react"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoginDialog } from '@/components/login-dialog'
import { Header } from '@/components/header'

interface LotteryEventWithProvider extends LotteryEvent {
  provider?: {
    id: string
    name: string
    logo_url?: string
    website?: string
  }
}

interface ParticipantWithUser extends LotteryParticipant {
  user?: Pick<User, 'id' | 'username' | 'avatar_url' | 'level'>
}

export default function LotteryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<LotteryEventWithProvider | null>(null)
  const [participants, setParticipants] = useState<ParticipantWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [participating, setParticipating] = useState(false)
  const [hasParticipated, setHasParticipated] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [userPoints, setUserPoints] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [levelInfo, setLevelInfo] = useState<Level | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    loadEvent()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // 获取用户积分和等级
        const res = await fetch('/api/checkin')
        const json = await res.json()
        if (json.success) {
          setUserPoints(json.data.points)
          setUserLevel(json.data.level)
          setLevelInfo(json.data.levelInfo)
        }
      }
    } catch (error) {
      console.error('Check auth error:', error)
    }
  }

  const loadEvent = async () => {
    try {
      // 获取活动详情
      const eventRes = await fetch(`/api/lottery/${params.id}`)
      const eventData = await eventRes.json()
      if (eventData.success) {
        setEvent(eventData.data)
      }

      // 获取参与者列表
      const participantsRes = await fetch(`/api/lottery/${params.id}/participate`)
      const participantsData = await participantsRes.json()
      if (participantsData.success) {
        setParticipants(participantsData.data)
        // 检查当前用户是否已参与
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const participated = participantsData.data.some(
            (p: ParticipantWithUser) => p.user_id === user.id
          )
          setHasParticipated(participated)
        }
      }
    } catch (error) {
      console.error('Load event error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计算实际消耗积分（考虑等级折扣）
  const getActualCost = () => {
    if (!event) return 0
    const discount = levelInfo?.lottery_discount || 0
    return Math.floor(event.points_cost * (100 - discount) / 100)
  }

  const handleParticipate = async () => {
    if (!user) {
      setLoginDialogOpen(true)
      return
    }

    const actualCost = getActualCost()
    if (actualCost > 0 && userPoints < actualCost) {
      toast.error(`积分不足！需要 ${actualCost} 积分，当前只有 ${userPoints} 积分`)
      return
    }

    setParticipating(true)
    try {
      const res = await fetch(`/api/lottery/${params.id}/participate`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setHasParticipated(true)
        setUserPoints(data.data.remaining_points)
        loadEvent()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('Participate error:', error)
    } finally {
      setParticipating(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime()
    const now = Date.now()
    const diff = end - now

    if (diff <= 0) return '已结束'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} 天 ${hours} 小时`
    if (hours > 0) return `${hours} 小时 ${minutes} 分钟`
    return `${minutes} 分钟`
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-gray-500/10 text-gray-500' },
      active: { label: '进行中', className: 'bg-green-500/10 text-green-500' },
      ended: { label: '已结束', className: 'bg-red-500/10 text-red-500' },
      drawn: { label: '已开奖', className: 'bg-purple-500/10 text-purple-500' },
    }
    const config = statusMap[status] || statusMap.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">活动不存在</h1>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  const actualCost = getActualCost()
  const hasDiscount = levelInfo && levelInfo.lottery_discount > 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {/* 活动详情 */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Link 
                      href={event.provider?.website || '#'} 
                      target="_blank"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Store className="h-4 w-4" />
                      {event.provider?.name || '未知店铺'}
                    </Link>
                    {getStatusBadge(event.status)}
                  </div>
                  <CardTitle className="text-2xl mt-2">{event.title}</CardTitle>
                  <CardDescription>
                    {event.description || '参与即有机会获得精美奖品'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 奖品信息 */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h3 className="flex items-center gap-2 font-semibold mb-3">
                      <Gift className="h-5 w-5 text-primary" />
                      奖品信息
                    </h3>
                    <div className="space-y-2">
                      <p className="font-medium text-lg">{event.prize}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">中奖名额: </span>
                        <span className="font-medium">{event.winner_count} 人</span>
                      </p>
                    </div>
                  </div>

                  {/* 积分消耗 */}
                  {event.points_cost > 0 && (
                    <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                      <h3 className="flex items-center gap-2 font-semibold mb-3">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        参与消耗
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {hasDiscount ? (
                            <>
                              <span className="text-2xl font-bold text-primary">{actualCost}</span>
                              <span className="text-lg line-through text-muted-foreground">{event.points_cost}</span>
                              <Badge className="bg-green-500/10 text-green-500">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Lv.{userLevel} 折扣 {levelInfo?.lottery_discount}%
                              </Badge>
                            </>
                          ) : (
                            <span className="text-2xl font-bold">{event.points_cost}</span>
                          )}
                          <span className="text-muted-foreground">积分</span>
                        </div>
                        {user && (
                          <p className="text-sm text-muted-foreground">
                            当前积分: <span className={userPoints >= actualCost ? 'text-green-500' : 'text-red-500'}>{userPoints}</span>
                            {userPoints < actualCost && <span className="text-red-500 ml-2">（积分不足）</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 活动时间 */}
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Clock className="h-5 w-5" />
                      活动时间
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">开始时间</span>
                        <span>{new Date(event.start_time).toLocaleString('zh-CN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">结束时间</span>
                        <span>{new Date(event.end_time).toLocaleString('zh-CN')}</span>
                      </div>
                      {event.status === 'active' && (
                        <div className="flex justify-between text-primary">
                          <span>剩余时间</span>
                          <span className="font-medium">{getTimeRemaining(event.end_time)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 参与进度 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <Users className="h-5 w-5" />
                        参与人数
                      </h3>
                      <span className="text-sm">
                        {event.current_participants} / {event.max_participants}
                      </span>
                    </div>
                    <Progress 
                      value={(event.current_participants / event.max_participants) * 100} 
                      className="h-3"
                    />
                  </div>

                  {/* 参与按钮 */}
                  {event.status === 'active' && (
                    <div className="pt-4">
                      {hasParticipated ? (
                        <Button className="w-full h-12 bg-green-600 hover:bg-green-600" disabled>
                          <Check className="h-5 w-5 mr-2" />
                          已参与
                        </Button>
                      ) : (
                        <Button 
                          className="w-full h-12" 
                          onClick={handleParticipate}
                          disabled={participating || (event.points_cost > 0 && userPoints < actualCost)}
                        >
                          {participating ? '参与中...' : (
                            <>
                              立即参与
                              {event.points_cost > 0 && (
                                <span className="ml-2 opacity-80">
                                  （消耗 {actualCost} 积分）
                                </span>
                              )}
                            </>
                          )}
                        </Button>
                      )}
                      {!user && (
                        <p className="text-center text-sm text-muted-foreground mt-2">
                          请先 <button onClick={() => setLoginDialogOpen(true)} className="text-primary hover:underline">登录</button> 后参与
                        </p>
                      )}
                    </div>
                  )}

                  {event.status === 'drawn' && (
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
                      <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="font-medium">本次抽奖已开奖</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        恭喜 {participants.filter(p => p.is_winner).length} 位幸运用户中奖！
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 参与者列表 */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    参与者 ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      暂无参与者，快来成为第一个！
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {participants.map((participant, index) => (
                        <div 
                          key={participant.id} 
                          className={`flex items-center gap-3 p-2 rounded-lg ${participant.is_winner ? 'bg-yellow-500/10 border border-yellow-500/20' : 'hover:bg-muted/50'}`}
                        >
                          <span className="text-sm text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatar_url} />
                            <AvatarFallback>
                              {participant.user?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {participant.user?.username || '匿名用户'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Lv.{participant.user?.level || 1}
                            </p>
                          </div>
                          {participant.is_winner && (
                            <Badge className="bg-yellow-500/10 text-yellow-500">
                              <Trophy className="h-3 w-3 mr-1" />
                              中奖
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 积分不足提示 */}
              {user && event.points_cost > 0 && userPoints < actualCost && event.status === 'active' && (
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-red-500 mb-2">积分不足</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/checkin">去签到赚积分</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        redirectPath={`/lottery/${params.id}`}
      />
    </div>
  )
}
