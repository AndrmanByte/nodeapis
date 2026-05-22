"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Clock,
  Coins,
} from "lucide-react";
import type { TrialOffer } from "@/lib/types";

interface TrialWithProvider extends TrialOffer {
  provider: NonNullable<TrialOffer['provider']>
  available_codes_count: number
}

export function TrialSection() {
  const [trials, setTrials] = useState<TrialWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrials() {
      try {
        const res = await fetch("/api/trials");
        const data = await res.json();
        if (data.success && data.data) {
          setTrials(data.data.slice(0, 6));
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchTrials();
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="h-16 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 bg-muted rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (trials.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">免费试用专区</h2>
              <p className="text-sm text-muted-foreground">了解中转站后领取兑换码，零成本体验</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-green-600 hover:text-green-700">
            <Link href="/trials">
              查看全部 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trials.map((trial) => (
            <HomeTrialCard key={trial.id} trial={trial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeTrialCard({ trial }: { trial: TrialWithProvider }) {
  const provider = trial.provider;
  const isExpiringSoon = trial.expires_at && new Date(trial.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
  const pointsCost = trial.points_cost ?? 0

  return (
    <Link href={`/providers/${provider.id}`} className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-card transition-all hover:shadow-lg hover:border-green-500/40 block">
      {/* Amount Banner */}
      <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-b border-green-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-green-600">{trial.amount}</p>
            <p className="text-sm text-muted-foreground mt-1">免费额度</p>
          </div>
          {pointsCost > 0 ? (
            <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/20 gap-1">
              <Coins className="h-3 w-3" /> {pointsCost} 积分
            </Badge>
          ) : (
            <Badge className="bg-green-500/15 text-green-700 border-green-500/20">免费</Badge>
          )}
        </div>
      </div>

      {/* Provider Info */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {provider.logo_url ? (
            <img src={provider.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{provider.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              {provider.name}
              {provider.is_verified && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
            </p>
            <p className="text-xs text-muted-foreground truncate">{provider.description}</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" />
            剩余 {trial.available_codes_count} 个码
          </span>
          {pointsCost > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Coins className="h-3.5 w-3.5" />
              消耗 {pointsCost} 积分
            </span>
          )}
          {trial.expires_at && (
            <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-orange-500' : ''}`}>
              <Clock className="h-3.5 w-3.5" />
              {isExpiringSoon ? '即将过期' : '有效至'} {new Date(trial.expires_at).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-1.5"
        >
          <Gift className="h-4 w-4" /> 点击领取
        </Button>
      </div>
    </Link>
  );
}
