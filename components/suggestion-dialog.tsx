"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { MessageSquarePlus, Loader2 } from "lucide-react"
import { SUGGESTION_CATEGORIES } from "@/lib/types"

interface SuggestionDialogProps {
  children?: React.ReactNode
}

export function SuggestionDialog({ children }: SuggestionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("请填写标题和内容")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setTitle("")
          setContent("")
          setCategory("general")
        }, 2000)
      } else {
        alert(data.error || "提交失败")
      }
    } catch {
      alert("提交失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            提建议
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageSquarePlus className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold">感谢您的建议</h3>
            <p className="text-muted-foreground text-center">
              我们会认真考虑您的建议，并尽快给您反馈
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>提交建议</DialogTitle>
              <DialogDescription>
                您的建议对我们非常重要，请详细描述您的想法或问题
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="suggestion-category">建议类型</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggestion-title">标题</Label>
                <Input
                  id="suggestion-title"
                  placeholder="简要描述您的建议"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/200
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggestion-content">详细描述</Label>
                <Textarea
                  id="suggestion-content"
                  placeholder="请详细描述您的建议、遇到的问题或希望增加的功能..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/2000
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                提交建议
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
