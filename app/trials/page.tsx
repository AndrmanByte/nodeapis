"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Gift,
  CheckCircle2,
  Clock,
  KeyRound,
  Coins,
} from "lucide-react"
import type { TrialOffer } from "@/lib/types"

interface TrialWithProvider extends TrialOffer {
  provider: NonNullable<TrialOffer['provider']>
  available_codes_count: number
}

export default function TrialsPage() {
  const [trials, setTrials] = useState<TrialWithProvider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrials() {
      try {
        const res = await fetch("/api/trials")
        const data = await res.json()
        if (data.success && data.data) {
          setTrials(data.data)
        }
      } catch (error) {
        console.error("获取试用活动失败:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrials()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>

          {/* Hero Banner */}
          <div className="mb-10 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-background border border-green-500/20 p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center shrink-0">
                <Gift className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">免费试用专区</h1>
                <p className="text-muted-foreground text-lg">
                  汇集 <span className="font-semibold text-green-600">{trials.length}</span> 个中转站免费额度，
                  了解服务后领取兑换码
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-20 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-muted rounded-full" />
                      <div className="h-5 w-20 bg-muted rounded-full" />
                    </div>
                    <div className="h-9 bg-muted rounded-lg w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : trials.length === 0 ? (
            <div className="py-20 text-center">
              <Gift className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
              <h2 className="text-xl font-semibold text-foreground mb-2">暂无可用试用</h2>
              <p className="text-muted-foreground">敬请期待中转站推出试用活动</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trials.map((trial) => (
                <TrialCard key={trial.id} trial={trial} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function TrialCard({ trial }: { trial: TrialWithProvider }) {
  const provider = trial.provider
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
          <div className="flex flex-col gap-1.5 items-end">
            {pointsCost > 0 ? (
              <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/20 gap-1">
                <Coins className="h-3 w-3" /> {pointsCost} 积分
              </Badge>
            ) : (
              <Badge className="bg-green-500/15 text-green-700 border-green-500/20">免费</Badge>
            )}
            {trial.description && (
              <Badge className="bg-green-500/15 text-green-700 border-green-500/20">
                {trial.description}
              </Badge>
            )}
          </div>
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
  )
}
