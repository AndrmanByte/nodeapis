"use client"

import Link from "next/link";
import Image from "next/image";
import { MessageSquarePlus, Send } from "lucide-react";
import { SuggestionDialog } from "@/components/suggestion-dialog";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="NodeAPIs Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">NodeAPIs</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              NodeAPIs 致力于收集和展示全网优质的AI API中转服务，帮助开发者找到最适合的API解决方案。
            </p>
            <div className="mt-4 flex gap-4 items-center">
              <a
                href="https://t.me/nodeapis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5 text-sm"
              >
                <Send className="h-5 w-5" />
                加入群组
              </a>
              <SuggestionDialog>
                <button className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1 text-sm">
                  <MessageSquarePlus className="h-4 w-4" />
                  提建议
                </button>
              </SuggestionDialog>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/providers" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  中转站列表
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  比价中心
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  提交中转站
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">关于</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NodeAPIs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
