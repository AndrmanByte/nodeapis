"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Loader2, X } from "lucide-react"
import type { ProviderComment } from "@/lib/types"

interface CommentWithProvider extends ProviderComment {
  provider?: { id: string; name: string; logo_url?: string }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [imageViewer, setImageViewer] = useState<string | null>(null)
  const limit = 20

  useEffect(() => {
    loadComments(1)
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* 标题 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">评论广场</h1>
              <p className="text-sm text-muted-foreground">查看所有用户对中转站的评价 ({total})</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 rounded-xl border border-border bg-card animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-lg font-semibold text-foreground mb-2">暂无评论</h2>
              <p className="text-sm text-muted-foreground mb-6">还没有用户发表评论，去中转站详情页评价吧</p>
              <Button asChild>
                <Link href="/providers">浏览中转站</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-6 rounded-xl border border-border bg-card">
                    {/* 中转站信息 */}
                    {comment.provider && (
                      <Link
                        href={`/providers/${comment.provider.id}`}
                        className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {comment.provider.logo_url ? (
                          <img src={comment.provider.logo_url} alt="" className="w-5 h-5 rounded object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{comment.provider.name[0]}</span>
                          </div>
                        )}
                        <span className="font-medium">{comment.provider.name}</span>
                      </Link>
                    )}

                    {/* 评论内容 */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={comment.user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {comment.user?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate">{comment.user?.username || '匿名用户'}</span>
                            <span className="text-xs text-muted-foreground shrink-0">Lv.{comment.user?.level || 1}</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${s <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-foreground whitespace-pre-line">{comment.content}</p>
                        {comment.images && comment.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {comment.images.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setImageViewer(img)}
                                className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-colors"
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadComments(page - 1)}
                    disabled={page <= 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadComments(page + 1)}
                    disabled={page >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
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
