"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Plus,
  ArrowLeft,
  Globe,
  DollarSign,
  Tag,
  Mail,
  Send,
  Sparkles,
  Shield,
  Clock,
  Award,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"
import type { Vendor } from "@/lib/types"

interface ModelPricing {
  model: string
  price: string
  multiplier: string
}

export default function SubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    logo_url: "",
    screenshot_url: "",
    contact_email: "",
  })

  const [models, setModels] = useState<ModelPricing[]>([
    { model: "", price: "", multiplier: "1" },
  ])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState("")
  const [copied, setCopied] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("idle")
    setErrorMsg("")

    if (vendors.length > 0 && selectedVendors.length === 0) {
      setStatus("error"); setErrorMsg("请至少选择一个支持厂商"); return
    }
    if (!formData.logo_url) {
      setStatus("error"); setErrorMsg("请上传 Logo 图片"); return
    }
    if (!formData.screenshot_url) {
      setStatus("error"); setErrorMsg("请上传官网截图"); return
    }
    if (customTags.length === 0) {
      setStatus("error"); setErrorMsg("请至少添加一个特色标签"); return
    }

    setLoading(true)
    try {
      const pricing = models.filter((m) => m.model.trim()).map((m) => ({
        model: m.model.trim(),
        input_price: parseFloat(m.price) || 0,
        output_price: (parseFloat(m.price) || 0) * (parseFloat(m.multiplier) || 1),
      }))
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, supported_vendors: selectedVendors, supported_models: pricing.map((p) => p.model), pricing, features: customTags }),
      })
      if (res.ok) { setStatus("success") } else { const data = await res.json(); setStatus("error"); setErrorMsg(data.error || "提交失败") }
    } catch { setStatus("error"); setErrorMsg("网络错误") } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>

          {status === "success" ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6"><CheckCircle className="h-8 w-8 text-green-600" /></div>
              <h2 className="text-2xl font-bold text-foreground mb-3">提交成功！</h2>
              <p className="text-muted-foreground mb-2">我们会在审核后将你的中转站添加到列表中。</p>
              <p className="text-sm text-muted-foreground mb-8">审核通过后你会收到通知，感谢你的贡献！</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStatus("idle")}>继续提交</Button>
                <Button onClick={() => router.push("/")}>返回首页</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-8 items-start">
              {/* Left: Form */}
              <div className="flex-1 min-w-0">
                <div className="mb-10">
                  <h1 className="text-3xl font-bold text-foreground mb-3">提交你的中转站</h1>
                  <p className="text-muted-foreground leading-relaxed">填写以下信息，提交后我们会尽快审核。审核通过后你的中转站将展示在列表中。</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Basic Info */}
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
                      <label className="text-sm font-medium text-foreground">简介 <span className="text-destructive">*</span></label>
                      <Textarea placeholder="简单描述你的服务特点" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} />
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

                  {/* Vendors */}
                  {vendors.length > 0 && (
                    <div className="space-y-6">
                      <SectionHeader icon={<Globe className="h-4 w-4 text-primary" />} title="支持厂商" desc="选择你支持的AI厂商（至少选一个）" />
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

                  {/* Model Pricing */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-foreground">模型与价格</h2>
                        <p className="text-xs text-muted-foreground">添加你支持的模型和对应价格</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addModel} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> 添加</Button>
                    </div>
                    <div className="space-y-3">
                      {models.map((mp, index) => (
                        <div key={index} className="flex gap-3 items-end p-4 rounded-lg border border-border bg-card/50">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1.5 block">模型名称 <span className="text-destructive">*</span></label>
                            <Input placeholder="如：gpt-4o、claude" value={mp.model} onChange={(e) => updateModel(index, "model", e.target.value)} required className="h-10" />
                          </div>
                          <div className="w-28">
                            <label className="text-xs text-muted-foreground mb-1.5 block">价格 (元/1M) <span className="text-destructive">*</span></label>
                            <Input type="number" step="0.01" placeholder="0.00" value={mp.price} onChange={(e) => updateModel(index, "price", e.target.value)} required className="h-10" />
                          </div>
                          <div className="w-24">
                            <label className="text-xs text-muted-foreground mb-1.5 block">输出倍率</label>
                            <Input type="number" step="0.1" placeholder="1" value={mp.multiplier} onChange={(e) => updateModel(index, "multiplier", e.target.value)} className="h-10" />
                          </div>
                          {models.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeModel(index)} className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">价格单位：元/1M tokens，倍率用于计算输出价格</p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-6">
                    <SectionHeader icon={<Tag className="h-4 w-4 text-primary" />} title="特色标签" desc="添加标签展示服务特色（至少1个，最多3个）" />
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

                  {/* Contact */}
                  <div className="space-y-6">
                    <SectionHeader icon={<Mail className="h-4 w-4 text-primary" />} title="联系方式" desc="用于审核沟通和问题反馈" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">联系邮箱 <span className="text-destructive">*</span></label>
                      <Input type="email" placeholder="your@email.com" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} required className="h-11" />
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"><XCircle className="h-4 w-4 shrink-0" />{errorMsg}</div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <Button type="submit" size="lg" className="w-full gap-2 h-12" disabled={loading}>
                      {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />提交中...</>) : (<><Send className="h-4 w-4" />提交申请</>)}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-6">
                {/* Why Submit */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">为什么要提交？</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><Sparkles className="h-4 w-4 text-green-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">免费曝光</p>
                        <p className="text-xs text-muted-foreground">展示给全网AI开发者</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><Shield className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">建立信任</p>
                        <p className="text-xs text-muted-foreground">认证标识提升可信度</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0"><Clock className="h-4 w-4 text-purple-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">快速审核</p>
                        <p className="text-xs text-muted-foreground">通常24小时内完成审核</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0"><Award className="h-4 w-4 text-yellow-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">积分奖励</p>
                        <p className="text-xs text-muted-foreground">提交成功获得50积分</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friend Link Requirement */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">友链要求</h3>
                  <p className="text-xs text-muted-foreground">提交中转站需在你的网站底部添加本站友链</p>

                  {/* Preview */}
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-xs text-muted-foreground mb-2">预览效果</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <img src="/icon.svg" alt="NodeAPIs" width={36} height={36} className="rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">NodeAPIs</p>
                        <p className="text-xs text-muted-foreground">AI API 中转站导航</p>
                      </div>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="relative">
                    <p className="text-xs text-muted-foreground mb-2">复制以下代码到你的网站底部</p>
                    <pre className="p-3 rounded-lg bg-muted text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
{`<a href="https://nodeapis.com" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;">
  <img src="https://nodeapis.com/icon.svg" alt="NodeAPIs" width="32" height="32" style="border-radius:6px;" />
  <span style="font-size:14px;font-weight:500;color:#111;">NodeAPIs</span>
</a>`}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-8 right-2 gap-1 h-7 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(`<a href="https://nodeapis.com" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;"><img src="https://nodeapis.com/icon.svg" alt="NodeAPIs" width="32" height="32" style="border-radius:6px;" /><span style="font-size:14px;font-weight:500;color:#111;">NodeAPIs</span></a>`)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? "已复制" : "复制"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
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
