"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, Coins, Gift, Home, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LoginDialog } from "@/components/login-dialog";

// Module-level auth cache to prevent flash on navigation
let cachedAuth: { isLoggedIn: boolean; points: number; level: number; timestamp: number } | null = null;
let authCheckPromise: Promise<void> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function clearAuthCache() {
  cachedAuth = null;
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(cachedAuth?.isLoggedIn ?? false);
  const [userPoints, setUserPoints] = useState(cachedAuth?.points ?? 0);
  const [userLevel, setUserLevel] = useState(cachedAuth?.level ?? 1);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Use cache if still valid
    if (cachedAuth && Date.now() - cachedAuth.timestamp < CACHE_DURATION) {
      setIsLoggedIn(cachedAuth.isLoggedIn);
      setUserPoints(cachedAuth.points);
      setUserLevel(cachedAuth.level);
      return;
    }

    // Prevent concurrent requests
    if (!authCheckPromise) {
      authCheckPromise = (async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('users')
              .select('points, level')
              .eq('id', user.id)
              .single();
            cachedAuth = {
              isLoggedIn: true,
              points: data?.points || 0,
              level: data?.level || 1,
              timestamp: Date.now(),
            };
          } else {
            cachedAuth = {
              isLoggedIn: false,
              points: 0,
              level: 1,
              timestamp: Date.now(),
            };
          }
        } catch {
          cachedAuth = {
            isLoggedIn: false,
            points: 0,
            level: 1,
            timestamp: Date.now(),
          };
        } finally {
          authCheckPromise = null;
        }
      })();
    }

    await authCheckPromise;

    if (cachedAuth) {
      setIsLoggedIn(cachedAuth.isLoggedIn);
      setUserPoints(cachedAuth.points);
      setUserLevel(cachedAuth.level);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string, color?: string) => {
    const active = isActive(href);
    if (color === 'green') {
      return `text-sm font-medium transition-colors inline-flex items-center gap-1.5 pb-0.5 border-b-2 ${
        active
          ? 'text-green-600 border-green-600'
          : 'text-green-600/70 border-transparent hover:text-green-600 hover:border-green-600/50'
      }`;
    }
    return `text-sm transition-colors inline-flex items-center gap-1.5 pb-0.5 border-b-2 ${
      active
        ? 'text-foreground font-medium border-primary'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
    }`;
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
                发现好用的中转站
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <Link href="/" className={navLinkClass('/')}>
              <Home className="h-4 w-4" />
              首页
            </Link>
            <Link href="/providers" className={navLinkClass('/providers')}>
              <Globe className="h-4 w-4" />
              中转站
            </Link>
            <Link href="/comments" className={navLinkClass('/comments')}>
              <MessageSquare className="h-4 w-4" />
              评论广场
            </Link>
            <Link href="/trials" className={navLinkClass('/trials', 'green')}>
              <Gift className="h-4 w-4" />
              免费试用
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
            <Button variant="ghost" size="sm" onClick={() => setLoginDialogOpen(true)}>
              登录
            </Button>
          )}
        </div>

        <LoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          redirectPath={typeof window !== 'undefined' ? window.location.pathname : '/'}
        />

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
          <nav className="flex flex-col gap-1">
            {[
              { href: '/', icon: Home, label: '首页' },
              { href: '/providers', icon: Globe, label: '中转站' },
              { href: '/comments', icon: MessageSquare, label: '评论广场' },
              { href: '/trials', icon: Gift, label: '免费试用', green: true },
            ].map(({ href, icon: Icon, label, green }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(href)
                    ? green
                      ? 'bg-green-500/10 text-green-600 font-medium'
                      : 'bg-primary/10 text-foreground font-medium'
                    : green
                      ? 'text-green-600/70 hover:text-green-600'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {isLoggedIn ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>个人中心</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => { setMobileMenuOpen(false); setLoginDialogOpen(true); }}>
                  登录
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
