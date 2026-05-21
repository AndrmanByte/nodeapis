"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  Star,
} from "lucide-react"
import type { Provider } from "@/lib/types"

export default function ProviderDetailPage() {
  const params = useParams()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [copied, setCopied] = useState(false)

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
        <main className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <Button asChild><Link href="/providers">返回列表</Link></Button>
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
          <Link href="/providers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> 返回列表
          </Link>

          <div className="flex gap-8 items-start">
            {/* Left: Provider Details */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Info Card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-5">
                  {provider.logo_url ? (
                    <img src={provider.logo_url} alt={provider.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-primary">{provider.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {provider.name}
                      {provider.is_verified && <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />}
                    </h1>
                    {provider.is_featured && (
                      <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                        <Zap className="h-3 w-3 mr-1" /> 推荐中转站
                      </Badge>
                    )}
                    {provider.description && (
                      <p className="mt-3 text-muted-foreground leading-relaxed">{provider.description}</p>
                    )}
                    <Button size="sm" className="mt-4 gap-1.5" asChild>
                      <a href={provider.website} target="_blank" rel="noopener noreferrer">
                        访问官网 <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
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
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-6">
              {/* Sponsor Ad */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">赞助位</Badge>
                  <h3 className="font-semibold text-foreground mb-1">在此投放广告</h3>
                  <p className="text-xs text-muted-foreground mb-3">精准触达AI开发者群体，提升品牌曝光</p>
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Mail className="h-3.5 w-3.5" /> 联系我们
                  </Button>
                </div>
              </div>

              {/* Submit Your Site */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">提交你的站点</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">让更多人发现你的AI API中转服务</p>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/submit">立即提交</Link>
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

          {/* Bottom Recommendations */}
          <div className="mt-12 p-6 rounded-xl border border-dashed border-border bg-card/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">热门中转站推荐</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "OpenRouter", desc: "多模型聚合路由，支持100+模型", rating: "4.8" },
                { name: "OneAPI", desc: "开源API管理面板，自建部署", rating: "4.6" },
                { name: "API2D", desc: "稳定的GPT API中转服务", rating: "4.5" },
                { name: "CloseAI", desc: "高可用AI API代理服务", rating: "4.4" },
              ].map((item) => (
                <Link key={item.name} href="/providers" className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{item.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{item.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              <Link href="/providers" className="text-primary hover:underline">查看更多中转站 →</Link>
            </p>
          </div>

          <div className="h-16" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
