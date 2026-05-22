"use client"

import { useState, useEffect } from 'react'
import { Gift, Clock, Users, ChevronRight, Trophy, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoginDialog } from '@/components/login-dialog'
import type { LotteryEvent } from '@/lib/types'

interface LotteryEventWithProvider extends LotteryEvent {
  provider?: { id: string; name: string; logo_url?: string }
}

export function LotterySection() {
  const [events, setEvents] = useState<LotteryEventWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<LotteryEventWithProvider | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [participating, setParticipating] = useState(false)
  const [hasJoined, setHasJoined] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/lottery')
      const data = await res.json()
      if (data.success) {
        setEvents(data.data || [])
        // Check if user has joined any events
        const { data: { user } } = await supabase.auth.getUser()
        if (user && data.data) {
          const joined: Record<string, boolean> = {}
          for (const event of data.data) {
            const checkRes = await fetch(`/api/lottery/${event.id}/participate`)
            const checkData = await checkRes.json()
            if (checkData.success && checkData.data) {
              const participants = Array.isArray(checkData.data) ? checkData.data : []
              joined[event.id] = participants.some((p: any) => p.user_id === user.id)
            }
          }
          setHasJoined(joined)
        }
      }
    } catch (error) {
      console.error('[v0] Failed to load lottery events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoginDialogOpen(true)
      return
    }

    setParticipating(true)
    try {
      const res = await fetch(`/api/lottery/${eventId}/participate`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setHasJoined(prev => ({ ...prev, [eventId]: true }))
        loadEvents() // Refresh counts
        setSelectedEvent(null)
      } else {
        toast.error(data.error || '参与失败，请稍后再试')
      }
    } catch (error) {
      console.error('[v0] Failed to join lottery:', error)
      toast.error('参与失败，请稍后再试')
    } finally {
      setParticipating(false)
    }
  }

  const formatTimeLeft = (endTime: string) => {
    const end = new Date(endTime).getTime()
    const now = Date.now()
    const diff = end - now

    if (diff <= 0) return '已结束'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse space-y-4">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
                <div className="h-4 bg-muted rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const activeEvents = events.filter(e => e.status === 'active')

  if (activeEvents.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20" id="lottery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">福利抽奖</h2>
              <p className="text-muted-foreground text-sm">参与抽奖，赢取丰厚奖品</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            {activeEvents.length} 个进行中
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeEvents.map((event) => (
            <Card 
              key={event.id}
              className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      由 {event.provider?.name || '未知店铺'} 赞助
                    </p>
                  </div>
                  {hasJoined[event.id] && (
                    <Badge className="bg-green-500/10 text-green-500">已参与</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>{event.prize} x{event.winner_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.current_participants}/{event.max_participants} 人参与</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeLeft(event.end_time)}</span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%` }}
                  />
                </div>

                <Button className="w-full gap-2" variant={hasJoined[event.id] ? "outline" : "default"}>
                  {hasJoined[event.id] ? '查看详情' : '立即参与'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              由 {selectedEvent?.provider?.name || '未知店铺'} 赞助
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEvent?.description && (
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
            )}

            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">奖品</span>
                <span className="font-medium flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  {selectedEvent?.prize} x{selectedEvent?.winner_count}
                </span>
              </div>
              {selectedEvent?.prize_description && (
                <p className="text-xs text-muted-foreground">{selectedEvent.prize_description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">参与人数</span>
                <span className="font-medium">{selectedEvent?.current_participants}/{selectedEvent?.max_participants}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">剩余时间</span>
                <span className="font-medium text-primary">{selectedEvent && formatTimeLeft(selectedEvent.end_time)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">中奖概率</span>
                <span className="font-medium text-green-500">
                  {selectedEvent && ((selectedEvent.winner_count / Math.max(selectedEvent.current_participants, 1)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            {selectedEvent && hasJoined[selectedEvent.id] ? (
              <Button variant="outline" className="w-full" disabled>
                <Ticket className="h-4 w-4 mr-2" />
                已参与抽奖
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={() => selectedEvent && handleJoin(selectedEvent.id)}
                disabled={participating}
              >
                {participating ? '参与中...' : '立即参与'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        redirectPath="/"
      />
    </section>
  )
}
