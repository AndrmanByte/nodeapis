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
} from "lucide-react"
import type { Provider, Advertisement, TrialOffer } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { LoginDialog } from "@/components/login-dialog"

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
    if (params.id) fetchProvider()

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
      <main className="px-4 py-8 sm:px-6 lg:px-8">
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
                    <img src={provider.screenshot_url} alt={`${provider.name} 截图`} className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
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
                      <img src={provider.logo_url} alt={provider.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border -mt-8 bg-card" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 -mt-8 border border-border bg-card">
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
                      {provider.is_featured && (
                        <Badge className="mt-1.5 bg-primary/10 text-primary border-primary/20">
                          <Zap className="h-3 w-3 mr-1" /> 推荐中转站
                        </Badge>
                      )}
                    </div>
                  </div>
                  {provider.description && (
                    <p className="mt-4 text-muted-foreground leading-relaxed">{provider.description}</p>
                  )}
                  {provider.advantages && provider.advantages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.advantages.map((a) => (
                        <span key={a} className="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-3 py-1 text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vendors / Models */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Tag className="h-4 w-4 text-primary" /></div>
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
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
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-foreground text-sm mb-1">操作</h3>

                {/* Like */}
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => setLiked(!liked)}
                >
                  <ThumbsUp className="h-4 w-4" /> {liked ? "已点赞" : "点赞"}
                </Button>

                {/* Feedback */}
                <div className="flex gap-2">
                  <Button
                    variant={feedback === "up" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setFeedback("up")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> 有帮助
                  </Button>
                  <Button
                    variant={feedback === "down" ? "destructive" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setFeedback("down")}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> 需改进
                  </Button>
                </div>

                {/* Copy Link */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "已复制" : "复制链接"}
                </Button>

                {feedback && <p className="text-xs text-center text-muted-foreground">感谢你的反馈！</p>}
              </div>
            </div>
          </div>

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
