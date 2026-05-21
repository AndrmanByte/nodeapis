"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { Provider } from "@/lib/types";

export function ProviderList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers");
        const data = await res.json();
        if (data.success && data.data) {
          setProviders(data.data);
        }
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  if (loading) {
    return (
      <section id="providers" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
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
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">中转站列表</h2>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">推荐中转站</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <h3 className="text-lg font-semibold text-foreground">最新收录</h3>
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

function ProviderCard({ provider, featured }: { provider: Provider; featured?: boolean }) {
  return (
    <Link href={`/providers/${provider.id}`} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 block">
      {/* Screenshot / Banner */}
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

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2.5 left-2.5">
            <Badge className="bg-primary text-primary-foreground gap-1">
              <Zap className="h-3 w-3" /> 推荐
            </Badge>
          </div>
        )}

        {/* Hover overlay */}
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

        {/* Features on image */}
        {(provider.features || []).length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {provider.features.slice(0, 3).map((f) => (
              <span key={f} className="text-xs bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">{f}</span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Name + Logo */}
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
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{provider.description}</p>


      </div>
    </Link>
  );
}
