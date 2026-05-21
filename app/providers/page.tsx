"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ExternalLink,
  CheckCircle2,
  Loader2,
  Search,
  ArrowLeft,
  Zap,
  Globe,
} from "lucide-react"
import type { Provider } from "@/lib/types"

const categories = ["全部", "GPT", "Claude", "Gemini", "开源"]

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers")
        const data = await res.json()
        if (data.success && data.data) {
          setProviders(data.data)
        }
      } catch (error) {
        console.error("获取数据失败:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProviders()
  }, [])

  const filtered = providers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory =
      selectedCategory === "全部" ||
      (p.supported_models || []).some((m) =>
        m.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    return matchSearch && matchCategory
  })

  const featured = filtered.filter((p) => p.is_featured)
  const normal = filtered.filter((p) => !p.is_featured)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">全部中转站</h1>
            <p className="text-muted-foreground">共收录 {providers.length} 个AI API中转站</p>
          </div>

          {/* Search + Filter */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索中转站名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">推荐中转站</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((p) => (
                      <ProviderCard key={p.id} provider={p} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* All */}
              {normal.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <div className="flex items-center gap-2 mb-5">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">全部中转站</h2>
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {normal.map((p) => (
                      <ProviderCard key={p.id} provider={p} />
                    ))}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">没有找到匹配的中转站</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ProviderCard({ provider, featured }: { provider: Provider; featured?: boolean }) {
  return (
    <Link href={`/providers/${provider.id}`} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 block">
      {/* Screenshot */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {provider.screenshot_url ? (
          <Image
            src={provider.screenshot_url}
            alt={provider.name}
            fill
            className="object-cover object-top transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">{provider.name.charAt(0)}</span>
          </div>
        )}
        {featured && (
          <div className="absolute top-2.5 left-2.5">
            <Badge className="bg-primary text-primary-foreground gap-1"><Zap className="h-3 w-3" /> 推荐</Badge>
          </div>
        )}
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/90 text-sm font-medium text-foreground shadow">
            访问官网 <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>
        {(provider.features || []).length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {provider.features.slice(0, 3).map((f) => (
              <span key={f} className="text-xs bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">{f}</span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {provider.logo_url ? (
            <Image src={provider.logo_url} alt="" width={36} height={36} className="rounded-lg shrink-0" unoptimized />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{provider.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-card-foreground truncate flex items-center gap-1.5">
              {provider.name}
              {provider.is_verified && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
            </h3>
            <a href={provider.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0">访问官网<ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(provider.supported_vendors && provider.supported_vendors.length > 0
            ? provider.supported_vendors
            : (provider.supported_models || [])
          ).slice(0, 4).map((item) => (
            <Badge key={item} variant="secondary" className="text-xs font-normal">{item}</Badge>
          ))}
          {(provider.supported_vendors?.length || provider.supported_models?.length || 0) > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">+{(provider.supported_vendors?.length || provider.supported_models?.length || 0) - 4}</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{provider.description}</p>

      </div>
    </Link>
  )
}
