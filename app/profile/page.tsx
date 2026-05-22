"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/lib/supabase/client'
import type { User, Provider, ProviderSubmission, Notification } from '@/lib/types'
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
  ArrowLeft
} from "lucide-react"
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }
    loadUserData()
  }

  const loadUserData = async () => {
    setLoading(true)
    try {
      // 获取用户信息
      const userRes = await fetch('/api/user')
      const userData = await userRes.json()
      if (userData.success) {
        setUser(userData.data)
        setUsername(userData.data.username || '')
      }

      // 获取店铺
      const providersRes = await fetch('/api/user/providers')
      const providersData = await providersRes.json()
      if (providersData.success) setProviders(providersData.data)

      // 获取提交记录
      const submissionsRes = await fetch('/api/user/submissions')
      const submissionsData = await submissionsRes.json()
      if (submissionsData.success) setSubmissions(submissionsData.data)

      // 获取通知
      const notificationsRes = await fetch('/api/notifications')
      const notificationsData = await notificationsRes.json()
      if (notificationsData.success) setNotifications(notificationsData.data)
    } catch (error) {
      console.error('Load user data error:', error)
    } finally {
      setLoading(false)
    }
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
    await supabase.auth.signOut()
    router.push('/')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 用户信息卡片 */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username || ''} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleUpdateProfile}>保存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>取消</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle>{user?.username || '未设置昵称'}</CardTitle>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditing(true)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
                {user && getRoleBadge(user.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">{providers.length}</span> 个店铺
                </div>
                <div>
                  <span className="font-medium text-foreground">{submissions.length}</span> 条提交
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    {notifications.filter(n => !n.is_read).length}
                  </span> 条未读通知
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="providers" className="gap-2">
                <Store className="h-4 w-4" />
                我的店铺
              </TabsTrigger>
              <TabsTrigger value="submissions" className="gap-2">
                <FileText className="h-4 w-4" />
                提交记录
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                通知
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notifications.filter(n => !n.is_read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                设置
              </TabsTrigger>
            </TabsList>

            {/* 我的店铺 */}
            <TabsContent value="providers" className="space-y-4 mt-6">
              {providers.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">您还没有店铺</p>
                    <p className="text-sm text-muted-foreground">提交中转站申请通过后将自动获得商家身份</p>
                  </CardContent>
                </Card>
              ) : (
                providers.map((provider) => (
                  <Card key={provider.id} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{provider.name}</h3>
                            <Badge variant={provider.status === 'online' ? 'default' : 'secondary'}>
                              {provider.status === 'online' ? '在线' : provider.status === 'offline' ? '离线' : '维护中'}
                            </Badge>
                            {provider.is_verified && <Badge variant="outline">已认证</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>评分: {provider.rating}</span>
                            <span>可用性: {provider.uptime}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={provider.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* 提交记录 */}
            <TabsContent value="submissions" className="space-y-4 mt-6">
              {submissions.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无提交记录</p>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission.id} className="border-border/50">
                    <CardContent className="p-6">
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
                            <p className="text-sm mt-2 p-2 bg-muted/50 rounded">
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
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* 通知 */}
            <TabsContent value="notifications" className="space-y-4 mt-6">
              {notifications.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无通知</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-border/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.is_read && handleMarkNotificationRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          notification.is_read ? 'bg-muted' : 'bg-primary'
                        }`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* 设置 */}
            <TabsContent value="settings" className="space-y-4 mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">账号信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <Label>邮箱</Label>
                      <span className="text-muted-foreground">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <Label>登录方式</Label>
                      <Badge variant="outline">{user?.auth_provider}</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <Label>注册时间</Label>
                      <span className="text-muted-foreground">
                        {user && new Date(user.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* 统一确认弹窗 */}
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
    </div>
  )
}
