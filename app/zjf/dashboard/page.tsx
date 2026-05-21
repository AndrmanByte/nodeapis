"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from '@/lib/supabase/client'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { ImageUpload } from '@/components/image-upload'
import type { Provider, User, LotteryEvent, Announcement, ProviderSubmission, Suggestion, Model, Vendor, Advertisement } from '@/lib/types'
import { SUGGESTION_CATEGORIES, SUGGESTION_STATUS } from '@/lib/types'
import { toast } from 'sonner'
import {
  Store, Users, Gift, Megaphone, FileText, Plus, Edit, Trash2, Check, X, LogOut, Search, ArrowLeft, Coins, MessageSquare, BarChart3, Cpu, Trophy, MonitorSpeaker
} from "lucide-react"
import Link from 'next/link'

interface LotteryEventWithProvider extends LotteryEvent {
  provider?: { id: string; name: string; logo_url?: string }
}

interface SubmissionWithUser extends ProviderSubmission {
  user?: { id: string; email: string; username?: string }
}

interface SuggestionWithUser extends Suggestion {
  user?: { id: string; email: string; username?: string; avatar?: string }
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<Provider[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [lotteryEvents, setLotteryEvents] = useState<LotteryEventWithProvider[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionWithUser[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [adDialogOpen, setAdDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [adLogoUrl, setAdLogoUrl] = useState("")

  const [providerSearch, setProviderSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [suggestionFilter, setSuggestionFilter] = useState('all')

  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [lotteryDialogOpen, setLotteryDialogOpen] = useState(false)
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false)
  const [modelDialogOpen, setModelDialogOpen] = useState(false)
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [providerLogoUrl, setProviderLogoUrl] = useState("")
  const [providerScreenshotUrl, setProviderScreenshotUrl] = useState("")
  const [editingLottery, setEditingLottery] = useState<LotteryEventWithProvider | null>(null)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [pointsAmount, setPointsAmount] = useState(0)
  const [pointsDescription, setPointsDescription] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // 开发环境跳过验证
    if (process.env.NODE_ENV === 'development') {
      loadAllData()
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const adminToken = document.cookie.includes('admin_token')
      if (!adminToken) {
        router.push('/zjf')
        return
      }
    }
    loadAllData()
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProviders(),
        loadUsers(),
        loadLotteryEvents(),
        loadAnnouncements(),
        loadSubmissions(),
        loadSuggestions(),
        loadModels(),
        loadVendors(),
        loadAdvertisements()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadProviders = async () => {
    const res = await fetch('/api/admin/providers')
    const data = await res.json()
    if (data.success) setProviders(data.data || [])
  }

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (data.success) setUsers(data.data || [])
  }

  const loadLotteryEvents = async () => {
    const res = await fetch('/api/admin/lottery')
    const data = await res.json()
    if (data.success) setLotteryEvents(data.data || [])
  }

  const loadAnnouncements = async () => {
    const res = await fetch('/api/announcements?all=true')
    const data = await res.json()
    if (data.success) setAnnouncements(data.data || [])
  }

  const loadSubmissions = async () => {
    const res = await fetch('/api/admin/submissions')
    const data = await res.json()
    if (data.success) setSubmissions(data.data || [])
  }

  const loadSuggestions = async () => {
    const res = await fetch('/api/admin/suggestions')
    const data = await res.json()
    if (data.success) setSuggestions(data.data || [])
  }

  const loadModels = async () => {
    const res = await fetch('/api/admin/models')
    const data = await res.json()
    if (data.success) setModels(data.data || [])
  }

  const loadVendors = async () => {
    const res = await fetch('/api/admin/vendors')
    const data = await res.json()
    if (data.success) setVendors(data.data || [])
  }

  const loadAdvertisements = async () => {
    const res = await fetch('/api/admin/advertisements')
    const data = await res.json()
    if (data.success) setAdvertisements(data.data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/zjf')
  }

  const handleSaveProvider = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const providerData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      website: formData.get('website') as string,
      logo_url: providerLogoUrl,
      screenshot_url: providerScreenshotUrl,
      status: formData.get('status') as string,
      uptime: parseFloat(formData.get('uptime') as string) || 99.9,
      rating: parseFloat(formData.get('rating') as string) || 4.5,
      is_verified: formData.get('is_verified') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      features: (formData.get('features') as string)?.split(',').map(f => f.trim()).filter(Boolean) || [],
      supported_vendors: formData.getAll('supported_vendors') as string[],
      supported_models: (formData.get('supported_models') as string)?.split(',').map(m => m.trim()).filter(Boolean) || [],
    }

    const url = editingProvider ? `/api/admin/providers/${editingProvider.id}` : '/api/admin/providers'
    const method = editingProvider ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerData)
    })
    const data = await res.json()
    if (data.success) {
      loadProviders()
      setProviderDialogOpen(false)
      setEditingProvider(null)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('确定要删除这个中转站吗？')) return
    const res = await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadProviders()
  }

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const data = await res.json()
    if (data.success) loadUsers()
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('确定要删除这个用户吗？')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadUsers()
  }

  const handleSaveLottery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const lotteryData = {
      provider_id: formData.get('provider_id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      prize: formData.get('prize') as string,
      winner_count: parseInt(formData.get('winner_count') as string) || 1,
      points_cost: parseInt(formData.get('points_cost') as string) || 0,
      max_participants: parseInt(formData.get('max_participants') as string) || 100,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      status: formData.get('status') as string,
    }

    const url = editingLottery ? `/api/admin/lottery/${editingLottery.id}` : '/api/admin/lottery'
    const method = editingLottery ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotteryData)
    })
    const data = await res.json()
    if (data.success) {
      loadLotteryEvents()
      setLotteryDialogOpen(false)
      setEditingLottery(null)
    }
  }

  const handleDeleteLottery = async (id: string) => {
    if (!confirm('确定要删除这个抽奖活动吗？')) return
    const res = await fetch(`/api/admin/lottery/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadLotteryEvents()
  }

  const handleDrawLottery = async (id: string, title: string) => {
    if (!confirm(`确定要对「${title}」进行开奖吗？开奖后不可撤销。`)) return
    const res = await fetch(`/api/admin/lottery/${id}/draw`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      toast.success(`开奖成功！共 ${data.data.winner_count} 人中奖，${data.data.total_participants} 人参与`)
      loadLotteryEvents()
    } else {
      toast.error(data.error || '开奖失败')
    }
  }

  const handleSaveAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const announcementData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as string,
      is_pinned: formData.get('is_pinned') === 'on',
      is_active: formData.get('is_active') === 'on',
    }

    const url = editingAnnouncement ? `/api/announcements/${editingAnnouncement.id}` : '/api/announcements'
    const method = editingAnnouncement ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcementData)
    })
    const data = await res.json()
    if (data.success) {
      loadAnnouncements()
      setAnnouncementDialogOpen(false)
      setEditingAnnouncement(null)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('确定要删除这个公告吗？')) return
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadAnnouncements()
  }

  const handleReviewSubmission = async (id: string, status: 'approved' | 'rejected', review_notes?: string) => {
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, review_notes })
    })
    const data = await res.json()
    if (data.success) {
      loadSubmissions()
      if (status === 'approved') loadProviders()
    }
  }

  const handleAdjustPoints = async () => {
    if (!selectedUserId || pointsAmount === 0) return
    
    const res = await fetch('/api/admin/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: selectedUserId,
        amount: pointsAmount,
        description: pointsDescription
      })
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`积分调整成功！新积分: ${data.data.new_points}`)
      setPointsDialogOpen(false)
      setPointsAmount(0)
      setPointsDescription('')
      setSelectedUserId(null)
      loadUsers()
    } else {
      toast.error(data.error || '积分调整失败')
    }
  }

  const openPointsDialog = (userId: string) => {
    setSelectedUserId(userId)
    setPointsAmount(0)
    setPointsDescription('')
    setPointsDialogOpen(true)
  }

  const handleUpdateSuggestion = async (id: string, status: string, reply?: string) => {
    const res = await fetch(`/api/admin/suggestions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_reply: reply })
    })
    const data = await res.json()
    if (data.success) loadSuggestions()
  }

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('确定要删除这条建议吗？')) return
    const res = await fetch(`/api/admin/suggestions/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadSuggestions()
  }

  const handleSaveModel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const modelData = {
      name: formData.get('name') as string,
      provider: formData.get('provider') as string,
      model_id: formData.get('model_id') as string,
      category: formData.get('category') as string || 'chat',
      is_active: (formData.get('is_active') as string) === 'on',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }

    const url = editingModel ? `/api/admin/models/${editingModel.id}` : '/api/admin/models'
    const method = editingModel ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelData)
    })
    const data = await res.json()
    if (data.success) {
      loadModels()
      setModelDialogOpen(false)
      setEditingModel(null)
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return
    const res = await fetch(`/api/admin/models/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadModels()
  }

  const handleSaveVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const vendorData = {
      name: formData.get('name') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: (formData.get('is_active') as string) === 'on',
    }

    const url = editingVendor ? `/api/admin/vendors/${editingVendor.id}` : '/api/admin/vendors'
    const method = editingVendor ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    })
    const data = await res.json()
    if (data.success) {
      loadVendors()
      setVendorDialogOpen(false)
      setEditingVendor(null)
    }
  }

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('确定要删除这个厂商吗？')) return
    const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadVendors()
  }

  const handleSaveAdvertisement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const adData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      logo_url: adLogoUrl,
      link: formData.get('link') as string,
      link_type: formData.get('link_type') as string,
      placement: formData.get('placement') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: (formData.get('is_active') as string) === 'on',
      btn_text: formData.get('btn_text') as string || '立即试用',
      start_time: formData.get('start_time') as string || null,
      end_time: formData.get('end_time') as string || null,
    }

    const url = editingAd ? `/api/admin/advertisements/${editingAd.id}` : '/api/admin/advertisements'
    const method = editingAd ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adData)
    })
    const data = await res.json()
    if (data.success) {
      loadAdvertisements()
      setAdDialogOpen(false)
      setEditingAd(null)
      setAdLogoUrl("")
    }
  }

  const handleDeleteAdvertisement = async (id: string) => {
    if (!confirm('确定要删除这个广告吗？')) return
    const res = await fetch(`/api/admin/advertisements/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadAdvertisements()
  }

  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(providerSearch.toLowerCase()))
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.username?.toLowerCase().includes(userSearch.toLowerCase()))
  const filteredSuggestions = suggestionFilter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.status === suggestionFilter)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold">NodeAPIs 管理后台</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-6 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{providers.length}</p>
                <p className="text-sm text-muted-foreground">中转站</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">用户</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Gift className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{lotteryEvents.length}</p>
                <p className="text-sm text-muted-foreground">抽奖活动</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{announcements.length}</p>
                <p className="text-sm text-muted-foreground">公告</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">待审核</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Cpu className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-sm text-muted-foreground">模型</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />统计</TabsTrigger>
            <TabsTrigger value="providers" className="gap-2"><Store className="h-4 w-4" />中转站</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />用户</TabsTrigger>
            <TabsTrigger value="lottery" className="gap-2"><Gift className="h-4 w-4" />抽奖</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2"><Megaphone className="h-4 w-4" />公告</TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="h-4 w-4" />审核
              {submissions.filter(s => s.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-1">{submissions.filter(s => s.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <MessageSquare className="h-4 w-4" />建议
              {suggestions.filter(s => s.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="ml-1">{suggestions.filter(s => s.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-2"><Cpu className="h-4 w-4" />模型</TabsTrigger>
            <TabsTrigger value="vendors" className="gap-2"><Store className="h-4 w-4" />厂商</TabsTrigger>
            <TabsTrigger value="ads" className="gap-2"><MonitorSpeaker className="h-4 w-4" />广告</TabsTrigger>
          </TabsList>

          {/* 网站统计 */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* 中转站管理 */}
          <TabsContent value="providers">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>中转站管理</CardTitle>
                  <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingProvider(null); setProviderLogoUrl(""); setProviderScreenshotUrl("") }} className="gap-2"><Plus className="h-4 w-4" />添加中转站</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>{editingProvider ? '编辑中转站' : '添加中转站'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveProvider} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="name">名称</Label><Input id="name" name="name" defaultValue={editingProvider?.name} required /></div>
                          <div className="space-y-2"><Label htmlFor="website">网站</Label><Input id="website" name="website" defaultValue={editingProvider?.website} required /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="description">描述</Label><Textarea id="description" name="description" defaultValue={editingProvider?.description} /></div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <ImageUpload label="Logo 图片" value={providerLogoUrl} onChange={setProviderLogoUrl} hint="正方形图片，建议 200x200" aspect="square" />
                          <ImageUpload label="官网截图" value={providerScreenshotUrl} onChange={setProviderScreenshotUrl} hint="首页截图，建议 1200x800" aspect="wide" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="status">状态</Label>
                            <Select name="status" defaultValue={editingProvider?.status || 'online'}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">在线</SelectItem>
                                <SelectItem value="offline">离线</SelectItem>
                                <SelectItem value="maintenance">维护中</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label htmlFor="uptime">可用性 (%)</Label><Input id="uptime" name="uptime" type="number" step="0.1" defaultValue={editingProvider?.uptime || 99.9} /></div>
                          <div className="space-y-2"><Label htmlFor="rating">评分</Label><Input id="rating" name="rating" type="number" step="0.1" min="1" max="5" defaultValue={editingProvider?.rating || 4.5} /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="features">特性 (逗号分隔)</Label><Input id="features" name="features" defaultValue={editingProvider?.features?.join(', ')} /></div>
                        <div className="space-y-2">
                          <Label>支持的厂商</Label>
                          <div className="flex flex-wrap gap-3">
                            {vendors.filter(v => v.is_active).map((vendor) => (
                              <label key={vendor.id} className="flex items-center gap-1.5 text-sm">
                                <input type="checkbox" name="supported_vendors" value={vendor.name} defaultChecked={editingProvider?.supported_vendors?.includes(vendor.name)} />
                                {vendor.name}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="supported_models">支持的模型 (逗号分隔)</Label><Input id="supported_models" name="supported_models" defaultValue={editingProvider?.supported_models?.join(', ')} /></div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2"><input type="checkbox" name="is_verified" defaultChecked={editingProvider?.is_verified} />已认证</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={editingProvider?.is_featured} />推荐</label>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-2 mt-4"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="搜索中转站..." value={providerSearch} onChange={(e) => setProviderSearch(e.target.value)} className="max-w-sm" /></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <Badge variant={provider.status === 'online' ? 'default' : 'secondary'}>{provider.status}</Badge>
                          {provider.is_verified && <Badge variant="outline">认证</Badge>}
                          {provider.is_featured && <Badge className="bg-yellow-500/10 text-yellow-500">推荐</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.website}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingProvider(provider); setProviderLogoUrl(provider.logo_url || ""); setProviderScreenshotUrl(provider.screenshot_url || ""); setProviderDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProvider(provider.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 用户管理 */}
          <TabsContent value="users">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
                <div className="flex items-center gap-2 mt-4"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="搜索用户..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="max-w-sm" /></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.username || '未设置昵称'}</h3>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'merchant' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? '管理员' : user.role === 'merchant' ? '商家' : '用户'}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            Lv.{user.level || 1}
                          </Badge>
                          {!user.is_active && <Badge variant="outline" className="text-red-500">已禁用</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            积分: <span className="font-medium text-foreground">{user.points || 0}</span>
                          </span>
                          <span>经验: {user.exp || 0}</span>
                          <span>注册于 {new Date(user.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openPointsDialog(user.id)} className="gap-1">
                          <Coins className="h-4 w-4" />
                          调整积分
                        </Button>
                        <Select defaultValue={user.role} onValueChange={(value) => handleUpdateUser(user.id, { role: value as 'user' | 'merchant' | 'admin' })}>
                          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">用户</SelectItem>
                            <SelectItem value="merchant">商家</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant={user.is_active ? 'outline' : 'default'} onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}>{user.is_active ? '禁用' : '启用'}</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 积分调整对话框 */}
            <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>调整用户积分</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="points_amount">积分变动</Label>
                    <Input 
                      id="points_amount" 
                      type="number" 
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                      placeholder="正数增加，负数扣除"
                    />
                    <p className="text-xs text-muted-foreground">输入正数增加积分，负数扣除积分</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points_description">变动原因</Label>
                    <Input 
                      id="points_description" 
                      value={pointsDescription}
                      onChange={(e) => setPointsDescription(e.target.value)}
                      placeholder="可选，如：活动奖励、违规扣除等"
                    />
                  </div>
                  <div className="flex gap-2 p-3 rounded-lg bg-muted/50">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPointsAmount(10)}
                    >+10</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPointsAmount(50)}
                    >+50</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPointsAmount(100)}
                    >+100</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPointsAmount(-10)}
                    >-10</Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPointsAmount(-50)}
                    >-50</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPointsDialogOpen(false)}>取消</Button>
                  <Button onClick={handleAdjustPoints} disabled={pointsAmount === 0}>
                    {pointsAmount >= 0 ? `增加 ${pointsAmount} 积分` : `扣除 ${Math.abs(pointsAmount)} 积分`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* 抽奖管理 */}
          <TabsContent value="lottery">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>抽奖活动管理</CardTitle>
                  <Dialog open={lotteryDialogOpen} onOpenChange={setLotteryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingLottery(null)} className="gap-2"><Plus className="h-4 w-4" />创建活动</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>{editingLottery ? '编辑活动' : '创建活动'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveLottery} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="provider_id">关联店铺</Label>
                          <Select name="provider_id" defaultValue={editingLottery?.provider_id}>
                            <SelectTrigger><SelectValue placeholder="选择店铺" /></SelectTrigger>
                            <SelectContent>{providers.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label htmlFor="title">活动标题</Label><Input id="title" name="title" defaultValue={editingLottery?.title} required /></div>
                        <div className="space-y-2"><Label htmlFor="description">活动描述</Label><Textarea id="description" name="description" defaultValue={editingLottery?.description || ''} /></div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="prize">奖品名称</Label><Input id="prize" name="prize" defaultValue={editingLottery?.prize} required /></div>
                          <div className="space-y-2"><Label htmlFor="winner_count">中奖人数</Label><Input id="winner_count" name="winner_count" type="number" defaultValue={editingLottery?.winner_count || 1} /></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="max_participants">最大参与人数</Label><Input id="max_participants" name="max_participants" type="number" defaultValue={editingLottery?.max_participants || 100} /></div>
                          <div className="space-y-2">
                            <Label htmlFor="points_cost">参与消耗积分</Label>
                            <Input id="points_cost" name="points_cost" type="number" defaultValue={editingLottery?.points_cost || 0} min="0" />
                            <p className="text-xs text-muted-foreground">设为0表示免费参与</p>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="start_time">开始时间</Label><Input id="start_time" name="start_time" type="datetime-local" defaultValue={editingLottery?.start_time?.slice(0, 16)} required /></div>
                          <div className="space-y-2"><Label htmlFor="end_time">结束时间</Label><Input id="end_time" name="end_time" type="datetime-local" defaultValue={editingLottery?.end_time?.slice(0, 16)} required /></div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">状态</Label>
                          <Select name="status" defaultValue={editingLottery?.status || 'draft'}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">草稿</SelectItem>
                              <SelectItem value="active">进行中</SelectItem>
                              <SelectItem value="ended">已结束</SelectItem>
                              <SelectItem value="cancelled">已取消</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lotteryEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant={event.status === 'active' ? 'default' : event.status === 'drawn' ? 'outline' : 'secondary'}>
                            {event.status === 'draft' ? '草稿' : event.status === 'active' ? '进行中' : event.status === 'ended' ? '已结束' : event.status === 'drawn' ? '已开奖' : '已取消'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">店铺: {event.provider?.name || '未知'}</p>
                        <p className="text-sm text-muted-foreground">参与: {event.current_participants}/{event.max_participants} | 奖品: {event.prize} x{event.winner_count}</p>
                      </div>
                      <div className="flex gap-2">
                        {event.status !== 'drawn' && event.status !== 'cancelled' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDrawLottery(event.id, event.title)}><Trophy className="h-4 w-4 mr-1" />开奖</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setEditingLottery(event); setLotteryDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteLottery(event.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {lotteryEvents.length === 0 && <p className="text-center text-muted-foreground py-8">暂无抽奖活动</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 公告管理 */}
          <TabsContent value="announcements">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>公告管理</CardTitle>
                  <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingAnnouncement(null)} className="gap-2"><Plus className="h-4 w-4" />发布公告</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingAnnouncement ? '编辑公告' : '发布公告'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="title">标题</Label><Input id="title" name="title" defaultValue={editingAnnouncement?.title} required /></div>
                        <div className="space-y-2"><Label htmlFor="content">内容</Label><Textarea id="content" name="content" rows={4} defaultValue={editingAnnouncement?.content} required /></div>
                        <div className="space-y-2">
                          <Label htmlFor="type">类型</Label>
                          <Select name="type" defaultValue={editingAnnouncement?.type || 'info'}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">信息</SelectItem>
                              <SelectItem value="warning">警告</SelectItem>
                              <SelectItem value="update">更新</SelectItem>
                              <SelectItem value="event">活动</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2"><input type="checkbox" name="is_pinned" defaultChecked={editingAnnouncement?.is_pinned} />置顶</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={editingAnnouncement?.is_active !== false} />激活</label>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <Badge variant={announcement.is_active ? 'default' : 'secondary'}>{announcement.is_active ? '激活' : '停用'}</Badge>
                          {announcement.is_pinned && <Badge className="bg-yellow-500/10 text-yellow-500">置顶</Badge>}
                          <Badge variant="outline">{announcement.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{announcement.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingAnnouncement(announcement); setAnnouncementDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteAnnouncement(announcement.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-center text-muted-foreground py-8">暂无公告</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 审核管理 */}
          <TabsContent value="submissions">
            <Card className="border-border/50">
              <CardHeader><CardTitle>提交审核</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">暂无提交记录</p>
                  ) : (
                    submissions.map((submission) => (
                      <div key={submission.id} className="p-4 border border-border/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{submission.name}</h3>
                              <Badge variant={submission.status === 'pending' ? 'secondary' : submission.status === 'approved' ? 'default' : 'destructive'}>
                                {submission.status === 'pending' ? '待审核' : submission.status === 'approved' ? '已通过' : '已拒绝'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{submission.website}</p>
                            <p className="text-sm">{submission.description}</p>
                            <p className="text-xs text-muted-foreground">提交者: {submission.user?.username || submission.user?.email || '未知'} | 提交于 {new Date(submission.submitted_at).toLocaleString('zh-CN')}</p>
                            {submission.supported_models?.length > 0 && (
                              <div className="flex flex-wrap gap-1">{submission.supported_models.map((model, i) => (<Badge key={i} variant="outline" className="text-xs">{model}</Badge>))}</div>
                            )}
                          </div>
                          {submission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleReviewSubmission(submission.id, 'approved')}><Check className="h-4 w-4 mr-1" />通过</Button>
                              <Button size="sm" variant="destructive" onClick={() => { const notes = prompt('请输入拒绝原因（可选）'); handleReviewSubmission(submission.id, 'rejected', notes || undefined) }}><X className="h-4 w-4 mr-1" />拒绝</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 建议管理 */}
          <TabsContent value="suggestions">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>用户建议</CardTitle>
                  <Select value={suggestionFilter} onValueChange={setSuggestionFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="筛选状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {SUGGESTION_STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSuggestions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">暂无建议</p>
                  ) : (
                    filteredSuggestions.map((suggestion) => {
                      const statusInfo = SUGGESTION_STATUS.find(s => s.value === suggestion.status)
                      const categoryInfo = SUGGESTION_CATEGORIES.find(c => c.value === suggestion.category)
                      return (
                        <div key={suggestion.id} className="p-4 border border-border/50 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{suggestion.title}</h3>
                                <Badge variant="outline">{categoryInfo?.label || suggestion.category}</Badge>
                                <Badge variant="secondary" className={statusInfo?.color}>{statusInfo?.label || suggestion.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestion.content}</p>
                              <p className="text-xs text-muted-foreground">
                                提交者: {suggestion.user?.username || suggestion.user?.email || '匿名'} | 
                                提交于 {new Date(suggestion.created_at).toLocaleString('zh-CN')}
                              </p>
                              {suggestion.admin_reply && (
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">管理员回复:</p>
                                  <p className="text-sm">{suggestion.admin_reply}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Select 
                                defaultValue={suggestion.status} 
                                onValueChange={(value) => handleUpdateSuggestion(suggestion.id, value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUGGESTION_STATUS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  const reply = prompt('请输入回复内容', suggestion.admin_reply || '')
                                  if (reply !== null) handleUpdateSuggestion(suggestion.id, suggestion.status, reply)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />回复
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteSuggestion(suggestion.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 模型管理 */}
          <TabsContent value="models">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>模型管理</CardTitle>
                  <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingModel(null)} className="gap-2"><Plus className="h-4 w-4" />添加模型</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingModel ? '编辑模型' : '添加模型'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveModel} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="name">名称</Label><Input id="name" name="name" defaultValue={editingModel?.name} placeholder="GPT-4o" required /></div>
                          <div className="space-y-2"><Label htmlFor="provider">提供商</Label><Input id="provider" name="provider" defaultValue={editingModel?.provider} placeholder="OpenAI" required /></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="model_id">模型 ID</Label><Input id="model_id" name="model_id" defaultValue={editingModel?.model_id} placeholder="gpt-4o" required /></div>
                          <div className="space-y-2"><Label htmlFor="category">分类</Label><Input id="category" name="category" defaultValue={editingModel?.category || 'chat'} placeholder="chat" /></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="sort_order">排序</Label><Input id="sort_order" name="sort_order" type="number" defaultValue={editingModel?.sort_order || 0} /></div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={editingModel?.is_active !== false} />激活</label>
                          </div>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                            <Badge variant="secondary" className="text-xs">{model.category}</Badge>
                            {!model.is_active && <Badge variant="outline" className="text-red-500 text-xs">已停用</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{model.model_id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingModel(model); setModelDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteModel(model.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {models.length === 0 && <p className="text-center text-muted-foreground py-8">暂无模型数据</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 厂商管理 */}
          <TabsContent value="vendors">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>厂商管理</CardTitle>
                  <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingVendor(null)} className="gap-2"><Plus className="h-4 w-4" />添加厂商</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingVendor ? '编辑厂商' : '添加厂商'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveVendor} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="name">厂商名称</Label><Input id="name" name="name" defaultValue={editingVendor?.name} placeholder="如：GPT、Claude、Gemini" required /></div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="sort_order">排序</Label><Input id="sort_order" name="sort_order" type="number" defaultValue={editingVendor?.sort_order || 0} /></div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={editingVendor?.is_active !== false} />激活</label>
                          </div>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{vendor.name}</span>
                        <Badge variant="secondary" className="text-xs">排序: {vendor.sort_order}</Badge>
                        {!vendor.is_active && <Badge variant="outline" className="text-red-500 text-xs">已停用</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingVendor(vendor); setVendorDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteVendor(vendor.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {vendors.length === 0 && <p className="text-center text-muted-foreground py-8">暂无厂商数据</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 广告管理 */}
          <TabsContent value="ads">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>广告管理</CardTitle>
                  <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingAd(null); setAdLogoUrl("") }} className="gap-2"><Plus className="h-4 w-4" />添加广告</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>{editingAd ? '编辑广告' : '添加广告'}</DialogTitle></DialogHeader>
                      <form onSubmit={handleSaveAdvertisement} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="ad_title">标题</Label><Input id="ad_title" name="title" defaultValue={editingAd?.title} placeholder="广告标题" required /></div>
                          <div className="space-y-2"><Label htmlFor="ad_btn_text">按钮文字</Label><Input id="ad_btn_text" name="btn_text" defaultValue={editingAd?.btn_text || '立即试用'} placeholder="立即试用" /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="ad_desc">描述</Label><Textarea id="ad_desc" name="description" defaultValue={editingAd?.description} placeholder="广告描述" rows={2} /></div>
                        <div className="space-y-2"><Label>Logo 图片</Label><ImageUpload value={adLogoUrl || editingAd?.logo_url || ""} onChange={setAdLogoUrl} label="" aspect="square" /></div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="ad_link">链接</Label><Input id="ad_link" name="link" defaultValue={editingAd?.link} placeholder="https://..." required /></div>
                          <div className="space-y-2">
                            <Label htmlFor="ad_link_type">链接类型</Label>
                            <Select name="link_type" defaultValue={editingAd?.link_type || 'external'}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="internal">站内链接</SelectItem>
                                <SelectItem value="external">外部链接</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="ad_placement">广告位</Label>
                            <Select name="placement" defaultValue={editingAd?.placement || 'home_top'}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home_top">首页顶部</SelectItem>
                                <SelectItem value="home_featured">首页推荐</SelectItem>
                                <SelectItem value="detail_sidebar">详情侧边栏</SelectItem>
                                <SelectItem value="detail_bottom">详情底部</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label htmlFor="ad_sort">排序</Label><Input id="ad_sort" name="sort_order" type="number" defaultValue={editingAd?.sort_order || 0} /></div>
                          <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={editingAd?.is_active !== false} />激活</label></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="ad_start">开始时间</Label><Input id="ad_start" name="start_time" type="datetime-local" defaultValue={editingAd?.start_time?.slice(0, 16)} /></div>
                          <div className="space-y-2"><Label htmlFor="ad_end">结束时间</Label><Input id="ad_end" name="end_time" type="datetime-local" defaultValue={editingAd?.end_time?.slice(0, 16)} /></div>
                        </div>
                        <DialogFooter><Button type="submit">保存</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advertisements.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        {ad.logo_url && <img src={ad.logo_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ad.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{ad.placement === 'home_top' ? '首页顶部' : ad.placement === 'home_featured' ? '首页推荐' : ad.placement === 'detail_sidebar' ? '详情侧边' : '详情底部'}</Badge>
                            <Badge variant="outline" className="text-xs">{ad.link_type === 'internal' ? '站内' : '外部'}</Badge>
                            {!ad.is_active && <Badge variant="outline" className="text-red-500 text-xs">已停用</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => { setEditingAd(ad); setAdLogoUrl(ad.logo_url); setAdDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteAdvertisement(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {advertisements.length === 0 && <p className="text-center text-muted-foreground py-8">暂无广告数据</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
