"use client"

import { useState, useEffect } from "react"
import { Sparkles, ExternalLink } from "lucide-react"
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
          className="block border-b px-4 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 transition-colors"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 pl-12">
            <span className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-primary/70">
              <Sparkles className="h-3 w-3" />
              赞助位
            </span>
            <span className="text-primary/30">│</span>
            {ad.logo_url && (
              <img src={ad.logo_url} alt="" className="w-5 h-5 rounded shrink-0 object-cover" />
            )}
            <span className="text-xs font-bold" style={{ fontFamily: "'Courier New', Consolas, 'Liberation Mono', monospace", letterSpacing: '0.15em' }}>{ad.title}</span>
            {ad.description && (
              <>
                <span className="text-primary/30 hidden sm:inline">│</span>
                <span className="text-xs opacity-60 hidden sm:inline">{ad.description}</span>
              </>
            )}
            <span className="text-primary/30">│</span>
            <span className="flex items-center gap-1 text-xs font-semibold group cursor-pointer">
              <span className="group-hover:underline">{ad.btn_text || '立即试用'}</span>
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
