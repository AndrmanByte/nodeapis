import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Mail, Send, MessageSquarePlus } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">联系我们</h1>
          <p className="text-muted-foreground mb-10">如有任何问题或建议，欢迎通过以下方式联系我们。</p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">邮箱</h3>
              <a href="mailto:contact@nodeapis.xyz" className="text-sm text-primary hover:underline">
                contact@nodeapis.xyz
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Telegram</h3>
              <a href="https://t.me/nodeapis" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                @nodeapis
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">建议反馈</h3>
              <p className="text-sm text-muted-foreground">
                登录后可通过站内「提建议」功能提交反馈
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
