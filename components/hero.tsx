"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Search, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium border border-primary/20">
          <Gift className="h-4 w-4" />
          零成本体验各家 AI API
        </div>

        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          免费体验，找到最适合你的
          <span className="text-primary"> AI 中转站</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
          汇集中转站免费试用额度，无需充值即可体验各家 API 服务。试过再选，不花冤枉钱。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white" asChild>
            <Link href="/trials">
              <Gift className="h-4 w-4" />
              领取免费额度
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="hover:text-foreground" asChild>
            <Link href="/providers">
              <Search className="h-4 w-4" />
              浏览全部中转站
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">免费试用</h3>
            <p className="text-sm text-muted-foreground">多家中转站提供免费额度</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">先试再选</h3>
            <p className="text-sm text-muted-foreground">体验后再决定充值哪家</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">零风险</h3>
            <p className="text-sm text-muted-foreground">不花一分钱找到最优服务</p>
          </div>
        </div>
      </div>
    </section>
  );
}
