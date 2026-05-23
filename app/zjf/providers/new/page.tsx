"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  XCircle,
  X,
  Plus,
  ArrowLeft,
  Globe,
  DollarSign,
  Tag,
  Mail,
  Send,
  Shield,
  Settings,
  Sparkles,
} from "lucide-react"
import type { Vendor } from "@/lib/types"

interface ModelPricing {
  model: string
  price: string
  multiplier: string
}

export default function AdminNewProviderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    api_url: "",
    short_description: "",
    description: "",
    logo_url: "",
    screenshot_url: "",
    contact_email: "",
    contact: "",
    register_type: "开放注册",
    min_deposit: "",
    status: "online",
    uptime: "99.9",
    rating: "4.5",
  })
  const [isVerified, setIsVerified] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [freeTrial, setFreeTrial] = useState(false)
  const [advantages, setAdvantages] = useState<string[]>([])
  const [advantageInput, setAdvantageInput] = useState("")
  const [models, setModels] = useState<ModelPricing[]>([{ model: "", price: "", multiplier: "1" }])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState("")
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => { if (data.success) setVendors(data.data || []) })
      .catch(() => {})
  }, [])

  const addModel = () => setModels([...models, { model: "", price: "", multiplier: "1" }])
  const removeModel = (index: number) => { if (models.length > 1) setModels(models.filter((_, i) => i !== index)) }
  const updateModel = (index: number, field: keyof ModelPricing, value: string) => setModels(models.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  const addCustomTag = () => { const tag = customTagInput.trim(); if (tag && customTags.length < 3 && !customTags.includes(tag)) { setCustomTags([...customTags, tag]); setCustomTagInput("") } }
  const removeCustomTag = (tag: string) => setCustomTags(customTags.filter((t) => t !== tag))

  const handleAiOptimize = async () => {
    if (!formData.name || !formData.description) {
      setError("请先填写名称和描述"); return
    }
    setAiLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai/optimize-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, description: formData.description }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setFormData({ ...formData, description: data.data })
      } else {
        setError(data.error || "AI 优化失败")
      }
    } catch {
      setError("AI 服务调用失败")
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.logo_url) { setError("请上传 Logo 图片"); return }
    if (!formData.screenshot_url) { setError("请上传官网截图"); return }

    setLoading(true)
    try {
      const pricing = models.filter((m) => m.model.trim()).map((m) => ({
        model: m.model.trim(),
        input_price: parseFloat(m.price) || 0,
        output_price: (parseFloat(m.price) || 0) * (parseFloat(m.multiplier) || 1),
      }))

      const body = {
        name: formData.name,
        short_description: formData.short_description,
        description: formData.description,
        website: formData.website,
        logo_url: formData.logo_url,
        screenshot_url: formData.screenshot_url,
        status: formData.status,
        uptime: parseFloat(formData.uptime) || 99.9,
        rating: parseFloat(formData.rating) || 4.5,
        is_verified: isVerified,
        is_featured: isFeatured,
        features: customTags,
        supported_vendors: selectedVendors,
        supported_models: pricing.map((p) => p.model),
        pricing,
        api_url: formData.api_url,
        contact_email: formData.contact_email,
        contact: formData.contact,
        register_type: formData.register_type,
        min_deposit: formData.min_deposit,
        payment_methods: paymentMethods,
        free_trial: freeTrial,
        advantages,
      }

      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        router.push("/zjf/dashboard")
      } else {
        setError(data.error || "创建失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold">添加中转站</h1>
          <Button variant="outline" size="sm" onClick={() => router.push("/zjf/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> 返回后台
          </Button>
        </div>
      </div>

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 基本信息 */}
            <div className="space-y-6">
              <SectionHeader icon={<Globe className="h-4 w-4 text-primary" />} title="基本信息" desc="填写中转站的基本信息" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">中转站名称 <span className="text-destructive">*</span></label>
                <Input placeholder="如：OpenAI API Proxy" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">网站地址 <span className="text-destructive">*</span></label>
                <Input type="url" placeholder="https://example.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} required className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">一句话描述 <span className="text-destructive">*</span></label>
                <Input placeholder="用一句话概括你的服务" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} required className="h-11" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">详细描述 <span className="text-destructive">*</span></label>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-primary" onClick={handleAiOptimize} disabled={aiLoading || !formData.name || !formData.description}>
                    {aiLoading ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI 优化中...</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> AI 优化</>
                    )}
                  </Button>
                </div>
                <Textarea placeholder="尽量详细描述你的服务特点、功能和优势，AI 会帮你优化成结构化描述" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={5} />
                <p className="text-xs text-muted-foreground">填写越多，AI 优化效果越好</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">优势亮点 <span className="text-muted-foreground font-normal">（最多3个，每个15字）</span></label>
                <div className="flex gap-2">
                  <Input placeholder="如：全网最低价" value={advantageInput} onChange={(e) => setAdvantageInput(e.target.value.slice(0, 15))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = advantageInput.trim(); if (v && advantages.length < 3 && !advantages.includes(v)) { setAdvantages([...advantages, v]); setAdvantageInput("") }}}} className="h-10" />
                  <Button type="button" variant="outline" onClick={() => { const v = advantageInput.trim(); if (v && advantages.length < 3 && !advantages.includes(v)) { setAdvantages([...advantages, v]); setAdvantageInput("") }}} disabled={!advantageInput.trim() || advantages.length >= 3}>添加</Button>
                </div>
                {advantages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {advantages.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/10 text-green-500 rounded-full">
                        {a}
                        <button type="button" onClick={() => setAdvantages(advantages.filter(x => x !== a))} className="hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload
                  label={<span>Logo 图片 <span className="text-destructive">*</span></span>}
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  hint="正方形图片，建议 200x200"
                  aspect="square"
                />
                <ImageUpload
                  label={<span>官网截图 <span className="text-destructive">*</span></span>}
                  value={formData.screenshot_url}
                  onChange={(url) => setFormData({ ...formData, screenshot_url: url })}
                  hint="首页截图，建议 1200x800"
                  aspect="wide"
                />
              </div>
            </div>

            {/* 支持厂商 */}
            {vendors.length > 0 && (
              <div className="space-y-6">
                <SectionHeader icon={<Globe className="h-4 w-4 text-primary" />} title="支持厂商" desc="选择支持的AI厂商" />
                <div className="flex flex-wrap gap-3">
                  {vendors.filter(v => v.is_active).map((vendor) => {
                    const selected = selectedVendors.includes(vendor.name)
                    return (
                      <button
                        key={vendor.id}
                        type="button"
                        onClick={() => setSelectedVendors(selected ? selectedVendors.filter(v => v !== vendor.name) : [...selectedVendors, vendor.name])}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50 text-foreground'}`}
                      >
                        {vendor.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 模型与价格 */}
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">模型与价格</h2>
                  <p className="text-xs text-muted-foreground">添加支持的模型和对应价格</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addModel} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> 添加</Button>
              </div>
              <div className="space-y-3">
                {models.map((mp, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="text-xs text-muted-foreground mb-1.5 block">模型名称 <span className="text-destructive">*</span></label>
                      <Input placeholder="如：gpt-4o、claude" value={mp.model} onChange={(e) => updateModel(index, "model", e.target.value)} required className="h-10" />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="text-xs text-muted-foreground mb-1.5 block">价格 (元/1M) <span className="text-destructive">*</span></label>
                      <Input type="number" step="0.01" placeholder="0.00" value={mp.price} onChange={(e) => updateModel(index, "price", e.target.value)} required className="h-10" />
                    </div>
                    <div className="w-full sm:w-24">
                      <label className="text-xs text-muted-foreground mb-1.5 block">输出倍率</label>
                      <Input type="number" step="0.1" placeholder="1" value={mp.multiplier} onChange={(e) => updateModel(index, "multiplier", e.target.value)} className="h-10" />
                    </div>
                    {models.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeModel(index)} className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive shrink-0"><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">价格单位：元/1M tokens，倍率用于计算输出价格</p>
            </div>

            {/* 特色标签 */}
            <div className="space-y-6">
              <SectionHeader icon={<Tag className="h-4 w-4 text-primary" />} title="特色标签" desc="添加标签展示服务特色（最多3个）" />
              <div className="flex gap-3">
                <Input placeholder="如：低延迟、高可用" value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())} className="h-10" />
                <Button type="button" variant="outline" onClick={addCustomTag} disabled={!customTagInput.trim() || customTags.length >= 3}>添加</Button>
              </div>
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeCustomTag(tag)} className="hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 联系方式 */}
            <div className="space-y-6">
              <SectionHeader icon={<Mail className="h-4 w-4 text-primary" />} title="联系方式" desc="用于审核沟通和问题反馈" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">联系邮箱</label>
                <Input type="email" placeholder="your@email.com" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">客服联系方式</label>
                <Input placeholder="如：Telegram @xxx、QQ群 123456" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="h-11" />
              </div>
            </div>

            {/* 服务详情 */}
            <div className="space-y-6">
              <SectionHeader icon={<Shield className="h-4 w-4 text-primary" />} title="服务详情" desc="补充中转站的服务信息" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">API 地址</label>
                <Input type="url" placeholder="https://api.example.com/v1" value={formData.api_url} onChange={(e) => setFormData({ ...formData, api_url: e.target.value })} className="h-11" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">注册方式</label>
                  <select value={formData.register_type} onChange={(e) => setFormData({ ...formData, register_type: e.target.value })} className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm">
                    <option value="开放注册">开放注册</option>
                    <option value="邀请码">邀请码</option>
                    <option value="需审核">需审核</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">起充金额</label>
                  <Input placeholder="如：¥1、$5" value={formData.min_deposit} onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })} className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">付费方式</label>
                <div className="flex flex-wrap gap-3">
                  {['支付宝', '微信', 'USDT', 'PayPal', '银行卡'].map((method) => {
                    const selected = paymentMethods.includes(method)
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethods(selected ? paymentMethods.filter(m => m !== method) : [...paymentMethods, method])}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50 text-foreground'}`}
                      >
                        {method}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="free_trial" checked={freeTrial} onChange={(e) => setFreeTrial(e.target.checked)} className="w-4 h-4 rounded border-border" />
                <label htmlFor="free_trial" className="text-sm font-medium text-foreground">提供免费试用 / 免费额度</label>
              </div>
            </div>

            {/* 管理员设置 */}
            <div className="space-y-6">
              <SectionHeader icon={<Settings className="h-4 w-4 text-primary" />} title="管理员设置" desc="设置中转站的展示状态和属性" />
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">状态</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm">
                    <option value="online">在线</option>
                    <option value="offline">离线</option>
                    <option value="maintenance">维护中</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">可用性 (%)</label>
                  <Input type="number" step="0.1" value={formData.uptime} onChange={(e) => setFormData({ ...formData, uptime: e.target.value })} className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">评分</label>
                  <Input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="h-11" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-4 h-4 rounded border-border" />
                  已认证
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-border" />
                  推荐
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"><XCircle className="h-4 w-4 shrink-0" />{error}</div>
            )}

            <div className="pt-4 border-t border-border">
              <Button type="submit" size="lg" className="w-full gap-2 h-12" disabled={loading}>
                {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />创建中...</>) : (<><Send className="h-4 w-4" />创建中转站</>)}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
