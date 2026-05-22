"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, X, ArrowRight, TrendingUp, ExternalLink, Sparkles, Flame, PenLine } from "lucide-react"
import type { ProviderComment, Advertisement } from "@/lib/types"

interface CommentWithProvider extends ProviderComment {
  provider?: { id: string; name: string; logo_url?: string }
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(dateStr).toLocaleDateString("zh-CN")
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [imageViewer, setImageViewer] = useState<string | null>(null)
  const [sidebarAds, setSidebarAds] = useState<Advertisement[]>([])
  const limit = 20

  useEffect(() => {
    loadComments(1)
    fetch('/api/advertisements?placement=comments_sidebar')
      .then(res => res.json())
      .then(data => { if (data.success) setSidebarAds(data.data || []) })
      .catch(() => {})
  }, [])

  const loadComments = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?page=${p}&limit=${limit}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.data || [])
        setTotal(data.total || 0)
        setPage(p)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  // 按中转站分组统计（取前5个热门）
  const providerMap = new Map<string, { id: string; name: string; logo_url?: string; count: number; avgRating: number }>()
  comments.forEach(c => {
    if (!c.provider) return
    const existing = providerMap.get(c.provider.id)
    if (existing) {
      existing.count++
      existing.avgRating = Math.round(((existing.avgRating * (existing.count - 1) + c.rating) / existing.count) * 10) / 10
    } else {
      providerMap.set(c.provider.id, { ...c.provider, count: 1, avgRating: c.rating })
    }
  })
  const hotProviders = [...providerMap.values()].sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 sm:px-6 lg:px-8 animate-page-enter">
        <div className="mx-auto max-w-5xl">
          {/* 顶部标题 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">评论广场</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">查看所有用户对 AI API 中转站的真实评价</p>
          </div>

          <div className="flex gap-8 items-start">
            {/* 左侧：评论列表 */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-5 rounded-xl border border-border bg-card animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 bg-muted rounded" />
                          <div className="h-3 w-16 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-20 rounded-xl border border-dashed border-border">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">暂无评论</h2>
                  <p className="text-sm text-muted-foreground mb-6">还没有用户发表评论，去中转站详情页评价吧</p>
                  <Button asChild size="sm">
                    <Link href="/providers">浏览中转站</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="group p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                        {/* 头部：用户信息 + 中转站 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user?.avatar_url} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {comment.user?.username?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">{comment.user?.username || '匿名用户'}</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Lv.{comment.user?.level || 1}</Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3 w-3 ${s <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                        </div>

                        {/* 评论内容 */}
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line mb-3">{comment.content}</p>

                        {/* 图片 */}
                        {comment.images && comment.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {comment.images.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setImageViewer(img)}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-colors"
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 底部：关联中转站 */}
                        {comment.provider && (
                          <Link
                            href={`/providers/${comment.provider.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {comment.provider.logo_url ? (
                              <img src={comment.provider.logo_url} alt="" className="w-4 h-4 rounded object-cover" />
                            ) : (
                              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-primary">{comment.provider.name[0]}</span>
                              </div>
                            )}
                            <span className="font-medium">{comment.provider.name}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadComments(page - 1)}
                        disabled={page <= 1}
                        className="gap-1"
                      >
                        上一页
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => loadComments(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              p === page
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        {totalPages > 7 && <span className="text-muted-foreground px-1">...</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadComments(page + 1)}
                        disabled={page >= totalPages}
                        className="gap-1"
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 右侧栏 */}
            <div className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-5">
              {/* 统计卡片 */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">评论统计</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{total}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">总评论</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{providerMap.size}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">被评中转站</p>
                  </div>
                </div>
              </div>

              {/* 热门中转站 */}
              {hotProviders.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold">热门中转站</h3>
                  </div>
                  <div className="space-y-3">
                    {hotProviders.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/providers/${p.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500/15 text-yellow-600' :
                          i === 1 ? 'bg-gray-400/15 text-gray-500' :
                          i === 2 ? 'bg-orange-500/15 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>{i + 1}</span>
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{p.name[0]}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(p.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{p.count}条</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 推荐中转站 */}
              {sidebarAds.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">推荐中转站</h3>
                  </div>
                  <div className="space-y-2.5">
                    {sidebarAds
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((ad) => (
                        <a
                          key={ad.id}
                          href={ad.link}
                          target={ad.link_type === 'external' ? '_blank' : undefined}
                          rel={ad.link_type === 'external' ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          {ad.logo_url ? (
                            <img src={ad.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-primary">{ad.title[0]}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ad.title}</p>
                            {ad.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{ad.description}</p>
                            )}
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {/* 引导 */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">分享你的体验</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">使用过 AI API 中转站？去详情页留下你的评价吧</p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/providers">浏览中转站</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* 图片查看器 */}
      {imageViewer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setImageViewer(null)}
        >
          <img src={imageViewer} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            onClick={() => setImageViewer(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
