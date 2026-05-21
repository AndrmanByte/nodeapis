import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">服务条款</h1>
          <p className="text-muted-foreground mb-10">最后更新：2025年1月</p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. 服务说明</h2>
              <p>NodeAPIs 是一个 AI API 中转站信息聚合平台，为用户提供中转站收录、展示和价格对比等信息服务。本站不隶属于任何第三方中转站服务商。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. 用户责任</h2>
              <p>用户在使用本站服务时应遵守相关法律法规，不得利用本站进行任何违法或有害活动。用户提交的信息应真实、准确。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. 内容声明</h2>
              <p>本站展示的中转站信息、价格、评分等数据仅供参考，不构成推荐或担保。服务商信息可能随时变更，请以各平台官方公告为准。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. 知识产权</h2>
              <p>本站内容（包括但不限于文字、图片、标识、页面设计）的知识产权归 NodeAPIs 所有。未经授权禁止复制、转载或用于商业用途。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. 免责声明</h2>
              <p>因使用第三方中转站服务导致的任何直接或间接损失，NodeAPIs 不承担任何责任。用户应自行评估使用第三方服务的风险。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. 条款变更</h2>
              <p>本站保留随时修改服务条款的权利，修改后的条款将在本页面公布。继续使用本站服务即视为接受修改后的条款。</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
