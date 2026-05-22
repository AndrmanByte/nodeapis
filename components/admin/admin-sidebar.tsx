"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3, Store, Users, Gift, Megaphone, FileText,
  MessageSquare, Cpu, Building2, MonitorSpeaker, LogOut, Menu, X, Sparkles, ArrowLeft
} from "lucide-react"

export type AdminSection =
  | "analytics" | "providers" | "users" | "lottery"
  | "announcements" | "submissions" | "suggestions"
  | "models" | "vendors" | "ads" | "trials"

interface MenuItem {
  id: AdminSection
  label: string
  icon: React.ReactNode
  badge?: number
}

interface AdminSidebarProps {
  active: AdminSection
  onChange: (section: AdminSection) => void
  pendingSubmissions: number
  pendingSuggestions: number
  onLogout: () => void
  mobileOpen: boolean
  onMobileToggle: () => void
}

export function AdminSidebar({
  active, onChange, pendingSubmissions, pendingSuggestions,
  onLogout, mobileOpen, onMobileToggle
}: AdminSidebarProps) {
  const menuItems: MenuItem[] = [
    { id: "analytics", label: "数据统计", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "providers", label: "中转站", icon: <Store className="h-4 w-4" /> },
    { id: "users", label: "用户管理", icon: <Users className="h-4 w-4" /> },
    { id: "lottery", label: "抽奖活动", icon: <Gift className="h-4 w-4" /> },
    { id: "trials", label: "试用管理", icon: <Sparkles className="h-4 w-4" /> },
    { id: "announcements", label: "公告管理", icon: <Megaphone className="h-4 w-4" /> },
    { id: "submissions", label: "审核管理", icon: <FileText className="h-4 w-4" />, badge: pendingSubmissions },
    { id: "suggestions", label: "用户建议", icon: <MessageSquare className="h-4 w-4" />, badge: pendingSuggestions },
    { id: "models", label: "模型管理", icon: <Cpu className="h-4 w-4" /> },
    { id: "vendors", label: "厂商管理", icon: <Building2 className="h-4 w-4" /> },
    { id: "ads", label: "广告管理", icon: <MonitorSpeaker className="h-4 w-4" /> },
  ]

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ fontFamily: "'Courier New', Consolas, monospace", letterSpacing: '0.15em' }}>
              NODE<span className="text-primary">APIS</span>
            </p>
            <p className="text-[9px] text-muted-foreground tracking-wider">管理后台</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onChange(item.id)
              if (mobileOpen) onMobileToggle()
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <a
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回首页</span>
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onMobileToggle}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border/50 shadow-sm"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-56 bg-card border-r border-border/50 transition-transform md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebar}
      </aside>
    </>
  )
}
