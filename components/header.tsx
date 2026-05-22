"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('points, level')
          .eq('id', user.id)
          .single();
        if (data) {
          setUserPoints(data.points || 0);
          setUserLevel(data.level || 1);
        }
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9">
              <Image
                src="/icon.svg"
                alt="NodeAPIs Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div className="absolute inset-0 rounded-lg border border-primary/30 group-hover:border-primary/60 transition-colors" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-[0.3em] text-foreground" style={{ fontFamily: "'Courier New', Consolas, 'Liberation Mono', monospace", textShadow: '0 0 10px rgba(var(--primary), 0.4)' }}>
                NODE<span className="text-primary">APIS</span>
              </span>
              <span className="text-[9px] tracking-[0.5em] text-muted-foreground/60 mt-0.5" style={{ fontFamily: "'Courier New', Consolas, monospace" }}>
                AI API 中转平台
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              首页
            </Link>
            <Link
              href="/providers"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              中转站
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              比价
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <Link href="/checkin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{userPoints}</span>
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Lv.{userLevel}</span>
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/checkin">签到</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="gap-2">
                  <User className="h-4 w-4" />
                  个人中心
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">登录</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href="/submit">提交中转站</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/providers"
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              中转站
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              比价
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              {isLoggedIn ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">个人中心</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">登录</Link>
                </Button>
              )}
              <Button size="sm" asChild>
                <Link href="/submit">提交中转站</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
