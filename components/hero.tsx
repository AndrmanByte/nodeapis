"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Search, Shield, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px] animate-pulse" />
        <div className="absolute right-1/4 bottom-0 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-orange-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/8 blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge with sparkle */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium border border-primary/20 animate-fade-in-up">
          <Gift className="h-4 w-4" />
          零成本体验各家 AI API
          <Sparkles className="h-3 w-3 text-primary/60" />
        </div>

        {/* Title with staggered animation */}
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          免费体验，找到最适合你的
          <span className="text-primary"> AI 中转站</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          汇集中转站免费试用额度，无需充值即可体验各家 API 服务。试过再选，不花冤枉钱。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white relative overflow-hidden group" asChild>
            <Link href="/trials">
              <Gift className="h-4 w-4" />
              领取免费额度
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="hover:text-foreground group" asChild>
            <Link href="/providers">
              <Search className="h-4 w-4" />
              浏览全部中转站
            </Link>
          </Button>
        </div>

        {/* Feature cards with hover effect */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            { icon: Gift, title: "免费试用", desc: "多家中转站提供免费额度", delay: "0.4s" },
            { icon: Search, title: "先试再选", desc: "体验后再决定充值哪家", delay: "0.5s" },
            { icon: Shield, title: "零风险", desc: "不花一分钱找到最优服务", delay: "0.6s" },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: delay }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-3px); }
          75% { transform: translateY(-15px) translateX(2px); }
        }
      `}</style>
    </section>
  );
}
