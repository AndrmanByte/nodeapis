"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Chrome, MessageCircle } from "lucide-react"
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/profile`,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请重试'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <CardTitle className="text-2xl">登录 NodeAPIs</CardTitle>
          <CardDescription>
            登录后可以管理店铺、参与抽奖、接收通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 gap-3"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
            >
              <Chrome className="h-5 w-5" />
              使用 Google 登录
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3"
              onClick={() => handleOAuthLogin('discord')}
              disabled={loading}
            >
              <MessageCircle className="h-5 w-5" />
              使用 Discord 登录
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
