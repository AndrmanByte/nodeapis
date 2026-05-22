"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";
import type { Provider, Advertisement, TrialOffer } from "@/lib/types";

export function ProviderList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [provRes, adRes] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/advertisements?placement=home_featured"),
        ])
        const provData = await provRes.json()
        const adData = await adRes.json()
        if (provData.success && provData.data) setProviders(provData.data)
        if (adData.success && adData.data) setAds(adData.data)
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="providers" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-14 bg-muted rounded-full" />
                      <div className="h-5 w-14 bg-muted rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-14 bg-muted rounded-full" />
                      <div className="h-5 w-14 bg-muted rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featured = providers.filter((p) => p.is_featured);
  const latest = providers
    .filter((p) => !p.is_featured)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <section id="providers" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Featured */}
        {(featured.length > 0 || ads.length > 0) && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">推荐中转站</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
              {featured.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} featured />
              ))}
            </div>
          </div>
        )}

        {/* Latest */}
        {latest.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">最新收录</h2>
                  <p className="text-sm text-muted-foreground">发现优质的 AI API 中转服务</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
                <Link href="/providers">
                  查看全部 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {providers.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">暂无数据，请先添加中转站</p>
          </div>
        )}
      </div>
    </section>
  );
}

function getBestTrial(provider: Provider): TrialOffer | undefined {
  const now = new Date().toISOString()
  return (provider.trial_offers || [])
    .filter((t) => t.is_active && (!t.expires_at || t.expires_at > now))
    .sort((a, b) => b.highlight_order - a.highlight_order)[0]
}

function ProviderCard({ provider, featured }: { provider: Provider; featured?: boolean }) {
  const bestTrial = getBestTrial(provider)
  return (
    <Link href={`/providers/${provider.id}`} className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 block w-full">
      {/* Screenshot / Banner */}
      <div
        className="group relative h-44 overflow-hidden"
        style={!provider.screenshot_url ? { background: 'radial-gradient(circle at top left, rgba(255,214,153,0.32), transparent 42%), linear-gradient(135deg, rgba(255,248,237,0.95), rgba(241,228,205,0.88))' } : undefined}
      >
        {provider.screenshot_url ? (
          <img src={provider.screenshot_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">{provider.name.charAt(0)}</span>
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2.5 left-2.5">
            <Badge className="bg-primary text-primary-foreground gap-1">
              <Zap className="h-3 w-3" /> 推荐
            </Badge>
          </div>
        )}

        {/* Trial badge */}
        {bestTrial && (
          <div className="absolute top-2.5 right-2.5">
            <Badge className="bg-green-500 text-white gap-1 shadow-md">
              <span>🎁</span> {bestTrial.amount} 免费试用
            </Badge>
          </div>
        )}

        {/* Features on image */}
        {(provider.features || []).length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {provider.features.slice(0, 3).map((f) => (
              <span key={f} className="text-xs bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">{f}</span>
            ))}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(provider.website, '_blank', 'noopener,noreferrer') }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/70 backdrop-blur-[10px] border border-white/30 text-foreground text-sm font-medium shadow-lg cursor-pointer hover:bg-white/80 transition-colors pointer-events-auto"
          >
            打开官网 <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Name + Logo */}
        <div className="flex items-center gap-3 mb-3">
          {provider.logo_url ? (
            <Image src={provider.logo_url} alt="" width={36} height={36} className="rounded-lg shrink-0" />
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
            <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(provider.website, '_blank', 'noopener,noreferrer') }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0 cursor-pointer">打开官网<ExternalLink className="h-3 w-3" /></span>
          </div>
        </div>

        {/* Vendors / Models */}
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

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{provider.short_description || provider.description}</p>


      </div>
    </Link>
  );
}

function AdCard({ ad }: { ad: Advertisement }) {
  const isExternal = ad.link_type === 'external'
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isExternal ? (
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border border-primary/30 bg-card transition-all hover:shadow-lg hover:border-primary/50 block">
        {children}
      </a>
    ) : (
      <Link href={ad.link} className="group relative overflow-hidden rounded-xl border border-primary/30 bg-card transition-all hover:shadow-lg hover:border-primary/50 block">
        {children}
      </Link>
    )

  return (
    <Wrapper>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">赞助</Badge>
        </div>
        <div className="flex items-center gap-3 mb-3">
          {ad.logo_url ? (
            <img src={ad.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{ad.title.charAt(0)}</span>
            </div>
          )}
          <h3 className="font-semibold text-card-foreground truncate">{ad.title}</h3>
        </div>
        {ad.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{ad.description}</p>}
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          {ad.btn_text || '立即试用'} <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </Wrapper>
  )
}
