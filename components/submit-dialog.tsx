"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle, X, Plus } from "lucide-react"
import type { Model } from "@/lib/types"

interface SubmitDialogProps {
  children: React.ReactNode
}

interface ModelPricing {
  model: string
  price: string
  multiplier: string
}

export function SubmitDialog({ children }: SubmitDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [availableModels, setAvailableModels] = useState<Model[]>([])

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    contact_email: '',
  })

  const [models, setModels] = useState<ModelPricing[]>([
    { model: '', price: '', multiplier: '1' }
  ])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState('')

  useEffect(() => {
    if (open) {
      fetch('/api/models')
        .then(res => res.json())
        .then(data => {
          if (data.success) setAvailableModels(data.data || [])
        })
        .catch(() => {})
    }
  }, [open])

  const addModel = () => {
    setModels([...models, { model: '', price: '', multiplier: '1' }])
  }

  const removeModel = (index: number) => {
    if (models.length > 1) {
      setModels(models.filter((_, i) => i !== index))
    }
  }

  const updateModel = (index: number, field: keyof ModelPricing, value: string) => {
    setModels(models.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const addCustomTag = () => {
    const tag = customTagInput.trim()
    if (tag && customTags.length < 3 && !customTags.includes(tag)) {
      setCustomTags([...customTags, tag])
      setCustomTagInput('')
    }
  }

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setErrorMsg('')

    try {
      const pricing = models
        .filter(m => m.model.trim())
        .map(m => ({
          model: m.model.trim(),
          input_price: parseFloat(m.price) || 0,
          output_price: (parseFloat(m.price) || 0) * (parseFloat(m.multiplier) || 1),
        }))

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supported_models: pricing.map(p => p.model),
          pricing,
          features: customTags,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', website: '', description: '', contact_email: '' })
        setModels([{ model: '', price: '', multiplier: '1' }])
        setCustomTags([])
        setTimeout(() => {
          setOpen(false)
          setStatus('idle')
        }, 2000)
      } else {
        const data = await res.json()
        setStatus('error')
        setErrorMsg(data.error || '提交失败，请稍后重试')
      }
    } catch {
      setStatus('error')
      setErrorMsg('网络错误，请检查连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>提交你的中转站</DialogTitle>
          <DialogDescription>
            填写以下信息，我们会在审核后将你的中转站添加到列表中。
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-12 w-12 text-primary" />
            <p className="text-center text-foreground">提交成功！我们会尽快审核。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                中转站名称 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="如：OpenAI API Proxy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                网站地址 <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">简介</label>
              <Input
                placeholder="简单描述你的服务特点"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* 模型和价格 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">模型与价格</label>
                <Button type="button" variant="ghost" size="sm" onClick={addModel} className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> 添加模型
                </Button>
              </div>

              {models.map((mp, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={mp.model}
                      onValueChange={(value) => updateModel(index, 'model', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((m) => (
                          <SelectItem key={m.model_id} value={m.model_id}>
                            {m.name} <span className="text-muted-foreground ml-1">({m.provider})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="价格"
                      value={mp.price}
                      onChange={(e) => updateModel(index, 'price', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="倍率"
                      value={mp.multiplier}
                      onChange={(e) => updateModel(index, 'multiplier', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  {models.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModel(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                价格单位：元/1K tokens，倍率用于计算输出价格（输出价格 = 价格 × 倍率）
              </p>
            </div>

            {/* 自定义标签 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                特色标签 <span className="text-muted-foreground text-xs">（最多3个）</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入标签，如：低延迟、高可用"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  className="h-8"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomTag}
                  disabled={!customTagInput.trim() || customTags.length >= 3}
                >
                  添加
                </Button>
              </div>
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                    >
                      {tag}
                      <button type="button" onClick={() => removeCustomTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                联系邮箱 <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '提交申请'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
