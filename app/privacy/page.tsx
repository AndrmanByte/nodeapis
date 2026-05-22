import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">隐私政策</h1>
          <p className="text-muted-foreground mb-10">最后更新：2025年1月</p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. 信息收集</h2>
              <p>我们通过第三方登录收集您的基本信息，包括邮箱地址和用户名。这些信息仅用于账户识别和站内通知。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. 信息使用</h2>
              <p>我们收集的信息仅用于以下目的：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>提供和维护本站服务</li>
                <li>用户账户管理和身份验证</li>
                <li>站内消息和审核通知</li>
                <li>改善用户体验</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. 信息存储与安全</h2>
              <p>您的数据存储在 Supabase 提供的安全数据库中，我们采用行业标准的安全措施保护您的个人信息。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. 信息共享</h2>
              <p>我们不会将您的个人信息出售、交易或转让给第三方，除非获得您的明确同意或法律要求。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Cookie</h2>
              <p>本站使用必要的 Cookie 来维持用户登录状态和提供基本功能。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. 政策变更</h2>
              <p>我们可能会不定期更新本隐私政策，修改后的政策将在本页面公布。</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
