"use client"

import { useState, useEffect } from "react"
import { Zap, ExternalLink } from "lucide-react"
import type { Advertisement } from "@/lib/types"

export function AdBanner({ onHasAds }: { onHasAds?: (has: boolean) => void }) {
  const [ads, setAds] = useState<Advertisement[]>([])

  useEffect(() => {
    fetch('/api/advertisements?placement=home_top')
      .then(res => res.json())
      .then(data => {
        const list = data.success ? (data.data || []) : []
        setAds(list)
        onHasAds?.(list.length > 0)
      })
      .catch(() => {})
  }, [])

  if (ads.length === 0) return null

  return (
    <div className="space-y-1">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link}
          target={ad.link_type === 'external' ? '_blank' : undefined}
          rel={ad.link_type === 'external' ? 'noopener noreferrer' : undefined}
          className="block border-b px-4 py-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 transition-colors"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 pl-12">
            <Zap className="h-4 w-4 shrink-0" />
            {ad.logo_url && (
              <img src={ad.logo_url} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
            )}
            <span className="font-medium text-sm">{ad.title}</span>
            {ad.description && <span className="text-sm opacity-80 hidden sm:inline">{ad.description}</span>}
            <span className="flex items-center gap-1 text-sm font-medium underline underline-offset-2">
              {ad.btn_text || '立即试用'} <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
