"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingDown, Search } from "lucide-react"
import type { Model, Provider, PricingTier } from "@/lib/types"

interface ProviderWithPricing {
  provider: Provider
  pricing: PricingTier
  rank: number
}

export function PriceComparison() {
  const [models, setModels] = useState<Model[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [inputTokens, setInputTokens] = useState("1000000")
  const [outputTokens, setOutputTokens] = useState("1000000")
  const [results, setResults] = useState<ProviderWithPricing[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedModel && providers.length > 0) {
      calculateResults()
    }
  }, [selectedModel, inputTokens, outputTokens, providers])

  const loadData = async () => {
    const [modelsRes, providersRes] = await Promise.all([
      fetch('/api/models'),
      fetch('/api/providers')
    ])
    const modelsData = await modelsRes.json()
    const providersData = await providersRes.json()

    if (modelsData.success) {
      setModels(modelsData.data || [])
      if (modelsData.data?.length > 0) {
        setSelectedModel(modelsData.data[0].model_id)
      }
    }
    if (providersData.success) {
      setProviders(providersData.data || [])
    }
  }

  const calculateResults = () => {
    const input = parseFloat(inputTokens) || 0
    const output = parseFloat(outputTokens) || 0

    const matched: ProviderWithPricing[] = []

    for (const provider of providers) {
      if (!provider.pricing) continue
      const tier = provider.pricing.find((p: PricingTier) =>
        p.model.toLowerCase().includes(selectedModel.toLowerCase()) ||
        selectedModel.toLowerCase().includes(p.model.toLowerCase())
      )
      if (tier) {
        matched.push({
          provider,
          pricing: tier,
          rank: 0,
        })
      }
    }

    matched.sort((a, b) => {
      const costA = (a.pricing.input_price / 1000) * input + (a.pricing.output_price / 1000) * output
      const costB = (b.pricing.input_price / 1000) * input + (b.pricing.output_price / 1000) * output
      return costA - costB
    })

    matched.forEach((item, index) => {
      item.rank = index + 1
    })

    setResults(matched)
  }

  const formatPrice = (price: number) => {
    return price.toFixed(4)
  }

  const formatTotal = (inputPrice: number, outputPrice: number) => {
    const input = parseFloat(inputTokens) || 0
    const output = parseFloat(outputTokens) || 0
    const total = (inputPrice / 1000) * input + (outputPrice / 1000) * output
    if (total >= 10000) {
      return `¥${(total / 10000).toFixed(2)}万`
    }
    return `¥${total.toFixed(2)}`
  }

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">比价中心</h2>
          <p className="mt-2 text-muted-foreground">选择模型，对比各中转站的实际花费</p>
        </div>

        {/* 控制区 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-card rounded-xl border border-border">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">选择模型</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.model_id} value={model.model_id}>
                    {model.name} <span className="text-muted-foreground ml-1">({model.provider})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">输入 Token 量</label>
            <Input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(e.target.value)}
              placeholder="1000000"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">输出 Token 量</label>
            <Input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(e.target.value)}
              placeholder="1000000"
            />
          </div>
        </div>

        {/* 结果列表 */}
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">中转站</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">输入价格</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">输出价格</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">预估总花费</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr
                    key={item.provider.id}
                    className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => window.open(item.provider.website, '_blank')}
                  >
                    <td className="py-4 px-4">
                      <Badge variant={item.rank === 1 ? "default" : "secondary"} className={item.rank === 1 ? "bg-primary" : ""}>
                        {item.rank === 1 && <TrendingDown className="h-3 w-3 mr-1" />}
                        {item.rank}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.provider.name}</span>
                        {item.provider.is_verified && (
                          <Badge variant="outline" className="text-xs">认证</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      ¥{formatPrice(item.pricing.input_price)}/1M
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      ¥{formatPrice(item.pricing.output_price)}/1M
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold text-lg ${item.rank === 1 ? 'text-primary' : 'text-foreground'}`}>
                        {formatTotal(item.pricing.input_price, item.pricing.output_price)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(item.provider.website, '_blank')
                        }}
                        className="gap-1"
                      >
                        去访问 <ExternalLink className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedModel ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无中转站提供该模型的定价数据</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>请选择一个模型开始比价</p>
          </div>
        )}
      </div>
    </section>
  )
}
