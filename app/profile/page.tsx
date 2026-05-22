"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from '@/lib/supabase/client'
import type { User, Provider, ProviderSubmission, Notification, TrialOffer } from '@/lib/types'
import { LoginDialog } from '@/components/login-dialog'
import { Header } from '@/components/header'
import { clearAuthCache } from '@/components/header'
import {
  User as UserIcon,
  Store,
  FileText,
  Bell,
  Settings,
  LogOut,
  Edit,
  Trash2,
  ExternalLink,
  Check,
  X,
  Clock,
  Gift,
  Plus,
  Loader2,
  KeyRound,
  Copy,
  Home,
  ChevronRight,
  Sparkles,
  Shield,
  Award,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [submissions, setSubmissions] = useState<ProviderSubmission[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: '', description: '', onConfirm: () => {} })
  const [trialDialog, setTrialDialog] = useState<{ open: boolean; providerId: string; providerName: string }>({ open: false, providerId: '', providerName: '' })
  const [trialForm, setTrialForm] = useState({ amount: '', description: '', expires_at: '', points_cost: '' })
  const [trialCodesInput, setTrialCodesInput] = useState('')
  const [trialSubmitting, setTrialSubmitting] = useState(false)
  const [providerTrials, setProviderTrials] = useState<Record<string, TrialOffer[]>>({})
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [claimedCodes, setClaimedCodes] = useState<any[]>([])
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('providers')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      setLoginDialogOpen(true)
      return
    }
    loadUserData()
  }

  const loadUserData = async () => {
    setLoading(true)
    try {
      const userRes = await fetch('/api/user')
      const userData = await userRes.json()
      if (userData.success) {
        setUser(userData.data)
        setUsername(userData.data.username || '')
      }

      const providersRes = await fetch('/api/user/providers')
      const providersData = await providersRes.json()
      if (providersData.success) setProviders(providersData.data)

      const submissionsRes = await fetch('/api/user/submissions')
      const submissionsData = await submissionsRes.json()
      if (submissionsData.success) setSubmissions(submissionsData.data)

      const notificationsRes = await fetch('/api/notifications')
      const notificationsData = await notificationsRes.json()
      if (notificationsData.success) setNotifications(notificationsData.data)

      const codesRes = await fetch('/api/user/claimed-codes')
      const codesData = await codesRes.json()
      if (codesData.success) setClaimedCodes(codesData.data)
    } catch (error) {
      console.error('Load user data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        setEditing(false)
      }
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    setConfirmDialog({ open: true, title: '删除店铺', description: '确定要删除这个店铺吗？此操作不可撤销。', onConfirm: async () => {
      try {
        const res = await fetch(`/api/user/providers/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setProviders(providers.filter(p => p.id !== id))
        }
      } catch (error) {
        console.error('Delete provider error:', error)
      }
    }})
  }

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Mark notification read error:', error)
    }
  }

  const handleLogout = async () => {
    clearAuthCache()
    await supabase.auth.signOut()
    router.push('/')
  }

  const openTrialDialog = async (providerId: string, providerName: string) => {
    setTrialDialog({ open: true, providerId, providerName })
    setTrialForm({ amount: '', description: '', expires_at: '', points_cost: '' })
    try {
      const res = await fetch(`/api/providers/${providerId}/trials`)
      const data = await res.json()
      if (data.success) {
        setProviderTrials(prev => ({ ...prev, [providerId]: data.data || [] }))
      }
    } catch {}
  }

  const parseTrialCodes = (input: string): string[] => {
    return input.split(/[\n,，;；\s]+/).map(c => c.trim()).filter(c => c.length > 0)
  }

  const handleCreateTrial = async () => {
    if (!trialForm.amount.trim()) return
    setTrialSubmitting(true)
    try {
      const codes = parseTrialCodes(trialCodesInput)
      const res = await fetch(`/api/providers/${trialDialog.providerId}/trials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trialForm,
          points_cost: parseInt(trialForm.points_cost) || 0,
          codes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProviderTrials(prev => ({
          ...prev,
          [trialDialog.providerId]: [data.data, ...(prev[trialDialog.providerId] || [])],
        }))
        setTrialForm({ amount: '', description: '', expires_at: '', points_cost: '' })
        setTrialCodesInput('')
      }
    } catch (error) {
      console.error('Create trial error:', error)
    } finally {
      setTrialSubmitting(false)
    }
  }

  const handleDeleteTrial = async (providerId: string, trialId: string) => {
    setConfirmDialog({
      open: true,
      title: '删除试用活动',
      description: '确定要删除这个试用活动吗？',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/providers/${providerId}/trials/${trialId}`, { method: 'DELETE' })
          const data = await res.json()
          if (data.success) {
            setProviderTrials(prev => ({
              ...prev,
              [providerId]: (prev[providerId] || []).filter(t => t.id !== trialId),
            }))
          }
        } catch (error) {
          console.error('Delete trial error:', error)
        }
      },
    })
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      user: { label: '普通用户', variant: 'secondary' },
      merchant: { label: '商家', variant: 'default' },
      admin: { label: '管理员', variant: 'destructive' },
    }
    const config = roleMap[role] || roleMap.user
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: '待审核', className: 'bg-yellow-500/10 text-yellow-500' },
      approved: { label: '已通过', className: 'bg-green-500/10 text-green-500' },
      rejected: { label: '已拒绝', className: 'bg-red-500/10 text-red-500' },
    }
    const config = statusMap[status] || statusMap.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const sidebarItems = [
    { id: 'providers', icon: Store, label: '我的店铺', color: 'text-blue-500', count: providers.length },
    { id: 'codes', icon: KeyRound, label: '兑换码', color: 'text-green-500', count: claimedCodes.length },
    { id: 'submissions', icon: FileText, label: '提交记录', color: 'text-purple-500', count: submissions.length },
    { id: 'notifications', icon: Bell, label: '通知', color: 'text-orange-500', count: unreadCount },
    { id: 'settings', icon: Settings, label: '设置', color: 'text-gray-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-8 sm:px-6 lg:px-8 animate-page-enter">
        <div className="mx-auto max-w-6xl">
          {/* Gradient header */}
          <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg shrink-0">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.username?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-9 max-w-xs" />
                      <Button size="sm" onClick={handleUpdateProfile}>保存</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>取消</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">{user?.username || '未设置昵称'}</h1>
                      <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-muted transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {user && getRoleBadge(user.role)}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-sm">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{user?.points || 0}</span>
                      <span className="text-muted-foreground">积分</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Lv.{user?.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-sm">
                      <Store className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{providers.length}</span>
                      <span className="text-muted-foreground">店铺</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-sm">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">{submissions.length}</span>
                      <span className="text-muted-foreground">提交</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content with sidebar */}
          <div className="flex gap-6 items-start">
            {/* Desktop sidebar */}
            <div className="hidden lg:block w-56 shrink-0 sticky top-24">
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? item.color : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile tabs */}
            <div className="lg:hidden w-full mb-4 overflow-x-auto">
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg min-w-max">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                      activeTab === item.id
                        ? 'bg-background text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${activeTab === item.id ? item.color : ''}`} />
                    {item.label}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-1 rounded-full">{item.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Providers tab */}
              {activeTab === 'providers' && (
                <div className="animate-fade-in">
                  {providers.length === 0 ? (
                    <div className="text-center py-16 rounded-xl border border-dashed border-border">
                      <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-2">您还没有店铺</p>
                      <p className="text-sm text-muted-foreground mb-4">提交中转站申请通过后将自动获得商家身份</p>
                      <Button size="sm" asChild>
                        <Link href="/submit">提交中转站</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {providers.map((provider) => (
                        <div key={provider.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors card-hover stagger-item">
                          {provider.screenshot_url && (
                            <div className="h-32 overflow-hidden bg-muted">
                              <img src={provider.screenshot_url} alt="" className="w-full h-full object-cover object-top" />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              {provider.logo_url ? (
                                <img src={provider.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold text-primary">{provider.name.charAt(0)}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{provider.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant={provider.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                                    {provider.status === 'online' ? '在线' : provider.status === 'offline' ? '离线' : '维护中'}
                                  </Badge>
                                  {provider.is_verified && <Badge variant="outline" className="text-xs">已认证</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 gap-1" asChild>
                                <a href={provider.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" /> 官网
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10" onClick={() => openTrialDialog(provider.id, provider.name)}>
                                <Gift className="h-3.5 w-3.5" /> 试用
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProvider(provider.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Codes tab */}
              {activeTab === 'codes' && (
                <div className="animate-fade-in">
                  {claimedCodes.length === 0 ? (
                    <div className="text-center py-16 rounded-xl border border-dashed border-border">
                      <KeyRound className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-2">暂无兑换码</p>
                      <p className="text-sm text-muted-foreground mb-4">去试用专区领取免费兑换码吧</p>
                      <Button size="sm" asChild>
                        <Link href="/trials">浏览试用活动</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {claimedCodes.map((item: any) => {
                        const offer = item.trial_offer
                        const provider = offer?.provider
                        return (
                          <div key={item.id} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors card-hover">
                            <div className="flex items-center gap-3 mb-3">
                              {provider?.logo_url ? (
                                <img src={provider.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold text-primary">{provider?.name?.charAt(0) || '?'}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{provider?.name || '未知中转站'}</p>
                                <p className="text-xs text-muted-foreground">{offer?.amount || ''}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.claimed_at && new Date(item.claimed_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-mono select-all">{item.code}</code>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 gap-1.5"
                                onClick={() => handleCopyCode(item.code, item.id)}
                              >
                                {copiedCodeId === item.id ? (
                                  <><Check className="h-3.5 w-3.5 text-green-500" /> 已复制</>
                                ) : (
                                  <><Copy className="h-3.5 w-3.5" /> 复制</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Submissions tab */}
              {activeTab === 'submissions' && (
                <div className="animate-fade-in">
                  {submissions.length === 0 ? (
                    <div className="text-center py-16 rounded-xl border border-dashed border-border">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">暂无提交记录</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors card-hover">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{submission.name}</h3>
                                {getStatusBadge(submission.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{submission.website}</p>
                              <p className="text-xs text-muted-foreground">
                                提交于 {new Date(submission.submitted_at).toLocaleString('zh-CN')}
                              </p>
                              {submission.review_notes && (
                                <p className="text-sm mt-2 p-3 bg-muted/50 rounded-lg">
                                  审核备注: {submission.review_notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              {submission.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                              {submission.status === 'approved' && <Check className="h-5 w-5 text-green-500" />}
                              {submission.status === 'rejected' && <X className="h-5 w-5 text-red-500" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications tab */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 rounded-xl border border-dashed border-border">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">暂无通知</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-xl border border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary/20 ${
                            !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                          onClick={() => !notification.is_read && handleMarkNotificationRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                              notification.is_read ? 'bg-muted' : 'bg-primary'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {new Date(notification.created_at).toLocaleString('zh-CN')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings tab */}
              {activeTab === 'settings' && (
                <div className="animate-fade-in space-y-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">账号信息</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <Label>邮箱</Label>
                        <span className="text-muted-foreground text-sm">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <Label>登录方式</Label>
                        <Badge variant="outline">{user?.auth_provider}</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <Label>注册时间</Label>
                        <span className="text-muted-foreground text-sm">
                          {user && new Date(user.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="destructive" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirm dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, open: false })) }}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trial dialog */}
      <Dialog open={trialDialog.open} onOpenChange={(open) => setTrialDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              试用活动管理 - {trialDialog.providerName}
            </DialogTitle>
            <DialogDescription>发布和管理该中转站的免费试用活动</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 border-b border-border pb-5">
            <h4 className="text-sm font-semibold text-foreground">发布新活动</h4>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="trial-amount">试用金额 *</Label>
                <Input id="trial-amount" placeholder="如: $5, ¥10, 100万Token" value={trialForm.amount} onChange={(e) => setTrialForm(prev => ({ ...prev, amount: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="trial-desc">活动说明</Label>
                <Input id="trial-desc" placeholder="如: 新用户注册即送" value={trialForm.description} onChange={(e) => setTrialForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="trial-codes">兑换码（每行一个或用逗号分隔，支持批量粘贴）</Label>
                <Textarea id="trial-codes" placeholder={"CODE1\nCODE2\nCODE3\n..."} rows={4} value={trialCodesInput} onChange={(e) => setTrialCodesInput(e.target.value)} />
                {trialCodesInput && (
                  <p className="text-xs text-muted-foreground mt-1">
                    已解析 <span className="font-medium text-foreground">{parseTrialCodes(trialCodesInput).length}</span> 个码
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="trial-expires">过期时间（可选）</Label>
                <Input id="trial-expires" type="datetime-local" value={trialForm.expires_at} onChange={(e) => setTrialForm(prev => ({ ...prev, expires_at: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="trial-points">领取消耗积分</Label>
                <Input id="trial-points" type="number" placeholder="0 表示免费领取" min="0" value={trialForm.points_cost} onChange={(e) => setTrialForm(prev => ({ ...prev, points_cost: e.target.value }))} />
                <p className="text-xs text-muted-foreground mt-1">设为0表示免费领取</p>
              </div>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={handleCreateTrial} disabled={!trialForm.amount.trim() || trialSubmitting}>
              {trialSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              发布
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">已有活动</h4>
            {(providerTrials[trialDialog.providerId] || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">暂无试用活动</p>
            ) : (
              (providerTrials[trialDialog.providerId] || []).map((trial) => (
                <div key={trial.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{trial.amount}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{trial.amount}</p>
                    {trial.description && <p className="text-xs text-muted-foreground">{trial.description}</p>}
                    {trial.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        过期: {new Date(trial.expires_at).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                  </div>
                  <Badge variant={trial.is_active ? 'default' : 'secondary'} className="shrink-0">
                    {trial.is_active ? '有效' : '已下线'}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleDeleteTrial(trialDialog.providerId, trial.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        redirectPath="/profile"
      />
    </div>
  )
}
