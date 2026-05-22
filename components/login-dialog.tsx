"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Chrome, MessageCircle, Loader2, Gift } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 当前页面路径，登录后会重定向回来 */
  redirectPath: string
  /** 登录成功后的额外回调（用于触发领取等操作） */
  onLoginSuccess?: () => void
}

export function LoginDialog({
  open,
  onOpenChange,
  redirectPath,
  onLoginSuccess,
}: LoginDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      })

      if (!error && onLoginSuccess) {
        onLoginSuccess()
      }

      if (error) throw error
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "登录失败，请重试"
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
        <DialogHeader className="text-center items-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-2">
            <Gift className="h-7 w-7 text-green-600" />
          </div>
          <DialogTitle className="text-xl">登录后领取试用额度</DialogTitle>
          <DialogDescription>
            登录后即可领取免费兑换码，体验 AI API 中转服务
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 gap-3"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="h-5 w-5" />
              )}
              使用 Google 登录
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3"
              onClick={() => handleOAuthLogin("discord")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MessageCircle className="h-5 w-5" />
              )}
              使用 Discord 登录
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
