"use client"

import { useState, useEffect } from 'react'
import { X, Bell, AlertTriangle, Sparkles, PartyPopper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Announcement } from '@/lib/types'

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements')
      const data = await res.json()
      if (data.success) {
        setAnnouncements(data.data || [])
      }
    } catch (error) {
      console.error('[v0] Failed to load announcements:', error)
    }
  }

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  const visibleAnnouncements = announcements.filter(a => !dismissed.has(a.id))

  if (visibleAnnouncements.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'update': return <Sparkles className="h-4 w-4" />
      case 'event': return <PartyPopper className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
      case 'update': return 'bg-blue-500/10 border-blue-500/20 text-blue-300'
      case 'event': return 'bg-green-500/10 border-green-500/20 text-green-300'
      default: return 'bg-primary/10 border-primary/20 text-primary'
    }
  }

  return (
    <div className="space-y-1">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative border-b px-4 py-2 ${getStyle(announcement.type)}`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getIcon(announcement.type)}
              <div className="flex items-center gap-2">
                {announcement.is_pinned && (
                  <Badge variant="outline" className="text-xs">置顶</Badge>
                )}
                <span className="font-medium text-sm">{announcement.title}</span>
                <span className="text-sm opacity-80">{announcement.content}</span>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="关闭公告"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
