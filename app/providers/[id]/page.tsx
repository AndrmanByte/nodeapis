"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  Loader2,
  DollarSign,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Send,
  Sparkles,
  Gift,
  Coins,
  Star,
  ImageIcon,
  Trash2,
  MessageSquare,
  X,
  Info,
} from "lucide-react"
import type { Provider, Advertisement, TrialOffer, ProviderComment } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { LoginDialog } from "@/components/login-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { uploadImage } from "@/lib/upload"

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [copied, setCopied] = useState(false)
  const [sidebarAds, setSidebarAds] = useState<Advertisement[]>([])
  const [bottomAds, setBottomAds] = useState<Advertisement[]>([])

  // 评论相关状态
  const [comments, setComments] = useState<ProviderComment[]>([])
  const [commentStats, setCommentStats] = useState({ count: 0, avg_rating: 0 })
  const [commentText, setCommentText] = useState("")
  const [commentRating, setCommentRating] = useState(5)
  const [commentImages, setCommentImages] = useState<string[]>([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [imageViewer, setImageViewer] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const supabase = createClient()

  const loadComments = async (providerId: string) => {
    try {
      const res = await fetch(`/api/providers/${providerId}/comments`)
      const data = await res.json()
      if (data.success) {
        setComments(data.data || [])
        setCommentStats(data.stats || { count: 0, avg_rating: 0 })
      }
    } catch {}
  }

  const handleSubmitComment = async () => {
    if (!currentUser) {
      setLoginDialogOpen(true)
      return
    }
    if (!commentText.trim()) {
      setCommentError("请输入评论内容")
      return
    }
    setSubmittingComment(true)
    setCommentError("")
    try {
      const res = await fetch(`/api/providers/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          images: commentImages,
          rating: commentRating,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => [data.data, ...prev])
        setCommentStats(prev => ({
          count: prev.count + 1,
          avg_rating: prev.count === 0
            ? data.data.rating
            : Math.round(((prev.avg_rating * prev.count + data.data.rating) / (prev.count + 1)) * 10) / 10,
        }))
        setCommentText("")
        setCommentRating(5)
        setCommentImages([])
      } else {
        setCommentError(data.error || "评论失败")
      }
    } catch {
      setCommentError("网络错误")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("确定删除这条评论？")) return
    try {
      const res = await fetch(`/api/providers/${params.id}/comments/${commentId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        const deleted = comments.find(c => c.id === commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
        setCommentStats(prev => ({
          count: prev.count - 1,
          avg_rating: prev.count <= 1 ? 0 : Math.round(((prev.avg_rating * prev.count - (deleted?.rating || 0)) / (prev.count - 1)) * 10) / 10,
        }))
      }
    } catch {}
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (commentImages.length >= 3) {
      setCommentError("最多上传3张图片")
      return
    }
    setUploadingImage(true)
    setCommentError("")
    try {
      const url = await uploadImage(file)
      setCommentImages(prev => [...prev, url])
    } catch {
      setCommentError("图片上传失败")
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    async function fetchProvider() {
      try {
        const res = await fetch(`/api/providers/${params.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProvider(data.data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchProvider()
      loadComments(params.id as string)
    }

    // 检查登录状态
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user)
    })

    fetch('/api/advertisements?placement=detail_sidebar')
      .then(res => res.json())
      .then(data => { if (data.success) setSidebarAds(data.data || []) })
      .catch(() => {})

    fetch('/api/advertisements?placement=detail_bottom')
      .then(res => res.json())
      .then(data => { if (data.success) setBottomAds(data.data || []) })
      .catch(() => {})
  }, [params.id])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-8" />
            <div className="flex gap-8 items-start">
              <div className="flex-1 min-w-0 space-y-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-xl bg-muted -mt-8 border border-border" />
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-5 w-20 bg-muted rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-4/5" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-16 bg-muted rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 animate-pulse space-y-3">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted rounded-full" />
                    <div className="h-8 w-24 bg-muted rounded-full" />
                    <div className="h-8 w-24 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
              <div className="w-80 shrink-0 space-y-6 hidden lg:block">
                <div className="rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
                  <div className="h-5 w-20 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded-lg" />
                  <div className="h-10 bg-muted rounded-lg" />
                </div>
                <div className="rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-20 text-center">
          <Globe className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold text-foreground mb-3">中转站不存在</h1>
          <p className="text-muted-foreground mb-8">该中转站可能已被删除或链接无效</p>
          <Button onClick={() => router.back()}>返回</Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 sm:px-6 lg:px-8 animate-page-enter">
        <div className="mx-auto max-w-6xl">
          {/* Back */}
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> 返回
          </button>

          <div className="flex gap-8 items-start">
            {/* Left: Provider Details */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Info Card */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Screenshot */}
                {provider.screenshot_url && (
                  <div className="relative aspect-video overflow-hidden bg-muted group">
                    <img src={provider.screenshot_url} alt={`${provider.name} 截图`} className="w-full h-full object-cover object-top transition-transform duration-[2000ms] group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/70 backdrop-blur-[10px] border border-white/30 text-foreground text-sm font-medium shadow-lg hover:bg-white/80 transition-colors pointer-events-auto">
                        访问官网 <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border -mt-8 bg-card relative z-10" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 -mt-8 border border-border bg-card relative z-10">
                        <span className="text-xl font-bold text-primary">{provider.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                          {provider.name}
                          {provider.is_verified && <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />}
                        </h1>
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0">
                          访问官网 <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      {provider.short_description && (
                        <p className="mt-1 text-sm text-muted-foreground">{provider.short_description}</p>
                      )}
                      {provider.is_featured && (
                        <Badge className="mt-1.5 bg-primary/10 text-primary border-primary/20">
                          <Zap className="h-3 w-3 mr-1" /> 推荐中转站
                        </Badge>
                      )}
                    </div>
                  </div>
                  {provider.description && (() => {
                    const sections = provider.description.split(/(?=【[^]+?】)/)
                    const plainParts = sections.filter(s => !s.match(/^【(.+?)】/))
                    return plainParts.some(s => s.trim()) ? (
                      <div className="mt-4 text-muted-foreground leading-relaxed">
                        {plainParts.map((s, i) => s.trim() ? <p key={i} className="mb-2">{s.trim()}</p> : null)}
                      </div>
                    ) : null
                  })()}
                  {provider.advantages && provider.advantages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.advantages.map((a) => (
                        <span key={a} className="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-3 py-1 text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description sections: 是什么, 能做什么, 常见问题 etc. */}
              {provider.description && (() => {
                const sections = provider.description.split(/(?=【[^]+?】)/)
                const titledParts = sections.filter(s => s.match(/^【(.+?)】/))
                if (titledParts.length === 0) return null

                const sectionPatterns: { match: string; icon: React.ReactNode; color: string; bg: string }[] = [
                  { match: '是什么', icon: <Zap className="h-4 w-4 text-blue-500" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { match: '能做什么', icon: <Sparkles className="h-4 w-4 text-green-500" />, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { match: '常见问题', icon: <MessageSquare className="h-4 w-4 text-purple-500" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ]

                return titledParts.map((section, i) => {
                  const match = section.match(/^【(.+?)】\s*([\s\S]*)$/)
                  if (!match) return null
                  const title = match[1]
                  const content = match[2].trim()
                  const pattern = sectionPatterns.find(p => title.includes(p.match))
                  const config = pattern || {
                    icon: <Info className="h-4 w-4 text-gray-500" />,
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                  }
                  const sectionType = pattern?.match || title

                  const renderContent = () => {
                    if (sectionType === '能做什么') {
                      return (
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {content.split('\n').filter(l => l.trim()).map((line, j) => (
                            <div key={j} className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm text-foreground/80 leading-relaxed">{line.replace(/^-\s*/, '').trim()}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    if (sectionType === '常见问题') {
                      const lines = content.split('\n').filter(l => l.trim())
                      const qaPairs: { q: string; a: string }[] = []
                      let current: { q: string; a: string } | null = null
                      for (const line of lines) {
                        const clean = line.replace(/^-\s*/, '').trim()
                        if (clean.startsWith('Q:') || clean.startsWith('问：')) {
                          if (current) qaPairs.push(current)
                          current = { q: clean.replace(/^(Q:|问：)\s*/, ''), a: '' }
                        } else if (clean.startsWith('A:') || clean.startsWith('答：')) {
                          if (current) current.a = clean.replace(/^(A:|答：)\s*/, '')
                        } else if (current) {
                          current.a += (current.a ? '\n' : '') + clean
                        }
                      }
                      if (current) qaPairs.push(current)

                      if (qaPairs.length > 0) {
                        return (
                          <div className="space-y-3">
                            {qaPairs.map((pair, j) => (
                              <div key={j} className="rounded-lg border border-border/60 overflow-hidden">
                                <div className="flex items-start gap-2.5 p-3.5 bg-purple-500/5">
                                  <span className="w-5 h-5 rounded bg-purple-500/15 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">Q</span>
                                  <span className="text-sm font-medium text-foreground leading-relaxed">{pair.q}</span>
                                </div>
                                <div className="flex items-start gap-2.5 p-3.5 border-t border-border/40">
                                  <span className="w-5 h-5 rounded bg-green-500/15 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">A</span>
                                  <span className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{pair.a}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      // Fallback: treat each line as a Q
                      return (
                        <div className="space-y-2.5">
                          {lines.map((line, j) => (
                            <div key={j} className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                              <MessageSquare className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                              <span className="text-sm text-foreground/80 leading-relaxed">{line.replace(/^-\s*/, '').trim()}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    if (sectionType === '是什么') {
                      return (
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{content}</p>
                        </div>
                      )
                    }
                    return <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{content}</p>
                  }

                  return (
                    <div key={i} className="rounded-xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>{config.icon}</div>
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                      </div>
                      {renderContent()}
                    </div>
                  )
                })
              })()}

              {/* Vendors / Models */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Globe className="h-4 w-4 text-blue-500" /></div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {provider.supported_vendors && provider.supported_vendors.length > 0 ? '支持厂商' : '支持模型'}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(provider.supported_vendors && provider.supported_vendors.length > 0
                    ? provider.supported_vendors
                    : (provider.supported_models || [])
                  ).map((item) => (
                    <Badge key={item} variant="secondary" className="text-sm py-1 px-3">{item}</Badge>
                  ))}
                  {(provider.supported_vendors?.length || 0) === 0 && (provider.supported_models?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground">暂无支持信息</p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              {provider.pricing && provider.pricing.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-yellow-500" /></div>
                    <h2 className="text-lg font-semibold text-foreground">价格信息</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">模型</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">输入价格</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">输出价格</th>
                        </tr>
                      </thead>
                      <tbody>
                        {provider.pricing.map((tier, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="py-3 px-4 text-sm font-medium">{tier.model}</td>
                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">¥{tier.input_price}/1M</td>
                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">¥{tier.output_price}/1M</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Features */}
              {(provider.features || []).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><Tag className="h-4 w-4 text-orange-500" /></div>
                    <h2 className="text-lg font-semibold text-foreground">服务特色</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature) => (
                      <span key={feature} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary font-medium">{feature}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Details */}
              {(provider.api_url || provider.register_type || provider.contact || provider.min_deposit || (provider.payment_methods && provider.payment_methods.length > 0) || provider.free_trial) && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center"><Shield className="h-4 w-4 text-teal-500" /></div>
                    <h2 className="text-lg font-semibold text-foreground">服务详情</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {provider.api_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">API 地址</p>
                        <a href={provider.api_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                          {provider.api_url}
                        </a>
                      </div>
                    )}
                    {provider.register_type && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">注册方式</p>
                        <p className="text-sm font-medium">{provider.register_type}</p>
                      </div>
                    )}
                    {provider.min_deposit && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">起充金额</p>
                        <p className="text-sm font-medium">{provider.min_deposit}</p>
                      </div>
                    )}
                    {provider.contact && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">客服联系方式</p>
                        <p className="text-sm font-medium">{provider.contact}</p>
                      </div>
                    )}
                    {provider.free_trial && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">免费试用</p>
                        <span className="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium">支持</span>
                      </div>
                    )}
                  </div>
                  {provider.payment_methods && provider.payment_methods.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">付费方式</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.payment_methods.map((method) => (
                          <span key={method} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">{method}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-6">
              {/* Sidebar Ads */}
              {sidebarAds.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.link}
                  target={ad.link_type === 'external' ? '_blank' : undefined}
                  rel={ad.link_type === 'external' ? 'noopener noreferrer' : undefined}
                  className="rounded-xl border border-border bg-card overflow-hidden block hover:border-primary/30 transition-colors"
                >
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                    <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">赞助位</Badge>
                    <div className="flex items-center gap-3 mb-2">
                      {ad.logo_url && <img src={ad.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <h3 className="font-semibold text-foreground">{ad.title}</h3>
                    </div>
                    {ad.description && <p className="text-xs text-muted-foreground mb-3">{ad.description}</p>}
                    <Button size="sm" variant="outline" className="w-full gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> {ad.btn_text || '立即试用'}
                    </Button>
                  </div>
                </a>
              ))}

              {/* Trial Offers */}
              {provider.trial_offers && provider.trial_offers.filter((t) => t.is_active && (!t.expires_at || t.expires_at > new Date().toISOString())).length > 0 && (
                <TrialOffersSection offers={provider.trial_offers.filter((t) => t.is_active && (!t.expires_at || t.expires_at > new Date().toISOString()))} />
              )}

              {/* Submit Your Site */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground text-sm">提交你的站点</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">让更多人发现你的AI API中转服务</p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/submit">提交</Link>
                </Button>
              </div>

              {/* Actions */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 gap-1.5 rounded-lg ${liked ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => setLiked(!liked)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      {liked ? "已点赞" : "点赞"}
                    </Button>
                    <div className="w-px h-5 bg-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5 rounded-lg"
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "已复制" : "分享"}
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-2.5">这个中转站对你有帮助吗？</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFeedback("up")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        feedback === "up"
                          ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${feedback === "up" ? 'fill-current' : ''}`} />
                      有帮助
                    </button>
                    <button
                      onClick={() => setFeedback("down")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        feedback === "down"
                          ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                      }`}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${feedback === "down" ? 'fill-current' : ''}`} />
                      需改进
                    </button>
                  </div>
                  {feedback && (
                    <p className="text-xs text-center text-green-600 mt-2.5 flex items-center justify-center gap-1">
                      <Check className="h-3 w-3" /> 感谢你的反馈！
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 评论区 */}
          <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
            {/* 评论头部 */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">用户评论 ({commentStats.count})</h2>
                    {commentStats.count > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= Math.round(commentStats.avg_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{commentStats.avg_rating} 分</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 发表评论 */}
            <div className="p-6 border-b border-border bg-muted/20">
              {currentUser ? (
                <div className="space-y-4">
                  {/* 星级评分 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">评分：</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setCommentRating(s)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${s <= commentRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400/50'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 评论内容 */}
                  <textarea
                    value={commentText}
                    onChange={(e) => { setCommentText(e.target.value); setCommentError("") }}
                    placeholder="分享你的使用体验..."
                    className="w-full min-h-[100px] rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    maxLength={1000}
                  />

                  {/* 图片预览 */}
                  {commentImages.length > 0 && (
                    <div className="flex gap-2">
                      {commentImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCommentImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer">
                        {uploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        图片
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage || commentImages.length >= 3} />
                      </label>
                      <span className="text-xs text-muted-foreground">{commentImages.length}/3</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {commentError && <span className="text-xs text-red-500">{commentError}</span>}
                      <Button
                        size="sm"
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="gap-1.5"
                      >
                        {submittingComment ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 发布中</>
                        ) : (
                          <><Send className="h-3.5 w-3.5" /> 发布评论</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">登录后即可发表评论</p>
                  <Button size="sm" onClick={() => setLoginDialogOpen(true)} className="gap-1.5">
                    登录评论
                  </Button>
                </div>
              )}
            </div>

            {/* 评论列表 */}
            <div className="divide-y divide-border">
              {comments.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">暂无评论，快来发表第一条吧</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-6">
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
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                            </span>
                            {currentUser?.id === comment.user_id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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
                ))
              )}
            </div>
          </div>

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

          {/* Bottom Ads */}
          {bottomAds.length > 0 && (
            <div className="mt-12 p-6 rounded-xl border border-dashed border-border bg-card/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">热门推荐</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {bottomAds.map((ad) => (
                  <Link key={ad.id} href={ad.link} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors">
                    {ad.logo_url ? (
                      <img src={ad.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{ad.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                      {ad.description && <p className="text-xs text-muted-foreground truncate">{ad.description}</p>}
                    </div>
                    <span className="text-xs text-primary font-medium shrink-0">{ad.btn_text || '立即试用'} →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="h-16" />
        </div>
      </main>
      <Footer />
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        redirectPath={typeof window !== 'undefined' ? window.location.pathname : ''}
      />
    </div>
  )
}

function TrialOffersSection({ offers }: { offers: Provider['trial_offers'] }) {
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [claimedCodes, setClaimedCodes] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [pendingTrialId, setPendingTrialId] = useState<string | null>(null)

  const supabase = createClient()

  // 页面加载时检查是否有待领取的试用
  useEffect(() => {
    const storedTrialId = localStorage.getItem('pendingClaimTrialId')
    if (storedTrialId) {
      localStorage.removeItem('pendingClaimTrialId')
      // 验证用户已登录后自动领取
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          handleClaim(storedTrialId)
        }
      })
    }
  }, [])

  const handleClaim = async (trialId: string) => {
    // 先检查是否已登录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // 未登录，存储待领取信息并弹出登录框
      localStorage.setItem('pendingClaimTrialId', trialId)
      setPendingTrialId(trialId)
      setShowLoginDialog(true)
      return
    }

    setClaimingId(trialId)
    setErrors(prev => ({ ...prev, [trialId]: '' }))
    try {
      const res = await fetch(`/api/trials/${trialId}/claim`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setClaimedCodes(prev => ({ ...prev, [trialId]: data.data.code }))
      } else {
        setErrors(prev => ({ ...prev, [trialId]: data.error || '领取失败' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, [trialId]: '网络错误' }))
    } finally {
      setClaimingId(null)
    }
  }

  const handleCopy = (trialId: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(trialId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLoginDialogChange = (open: boolean) => {
    setShowLoginDialog(open)
    if (!open) {
      // 关闭登录框时清除待领取状态
      localStorage.removeItem('pendingClaimTrialId')
      setPendingTrialId(null)
    }
  }

  if (!offers || offers.length === 0) return null

  return (
    <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/10 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
            <Gift className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">免费试用</h3>
            <p className="text-xs text-muted-foreground">领取兑换码，零成本体验</p>
          </div>
        </div>
        <div className="space-y-2">
          {offers
            .sort((a, b) => b.highlight_order - a.highlight_order)
            .map((trial) => (
              <div key={trial.id} className="p-3 rounded-lg bg-card border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-green-600">{trial.amount}</span>
                  {(trial.points_cost ?? 0) > 0 ? (
                    <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                      <Coins className="h-3 w-3" /> {trial.points_cost ?? 0} 积分
                    </span>
                  ) : (
                    <span className="text-xs text-green-600">免费</span>
                  )}
                </div>
                {trial.expires_at && (
                  <p className="text-xs text-muted-foreground mb-1">
                    有效至 {new Date(trial.expires_at).toLocaleDateString('zh-CN')}
                  </p>
                )}
                {trial.description && (
                  <p className="text-xs text-muted-foreground mb-2">{trial.description}</p>
                )}
                {claimedCodes[trial.id] ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <code className="text-xs font-mono font-bold text-green-700 flex-1 truncate">{claimedCodes[trial.id]}</code>
                    <button onClick={() => handleCopy(trial.id, claimedCodes[trial.id])} className="p-0.5 rounded hover:bg-green-500/20 shrink-0">
                      {copiedId === trial.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-green-600" />}
                    </button>
                  </div>
                ) : (
                  <div>
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => handleClaim(trial.id)}
                      disabled={claimingId === trial.id}
                    >
                      {claimingId === trial.id ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 领取中</>
                      ) : (
                        <><Gift className="h-3.5 w-3.5" /> 点击领取</>
                      )}
                    </Button>
                    {errors[trial.id] && <p className="text-xs text-red-500 mt-1">{errors[trial.id]}</p>}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={handleLoginDialogChange}
        redirectPath={typeof window !== 'undefined' ? window.location.pathname : ''}
      />
    </div>
  )
}
