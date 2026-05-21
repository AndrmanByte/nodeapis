"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckinCard } from "@/components/checkin-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sprout, Leaf, TreeDeciduous, Star, Crown, Trophy, Gem,
  ArrowRight
} from "lucide-react"
import { useEffect, useState } from "react"
import type { Level } from "@/lib/types"

const ICON_MAP: Record<string, React.ReactNode> = {
  Sprout: <Sprout className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  TreeDeciduous: <TreeDeciduous className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Trophy: <Trophy className="h-6 w-6" />,
  Gem: <Gem className="h-6 w-6" />,
}

const COLOR_MAP: Record<string, string> = {
  gray: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  green: 'text-green-500 bg-green-500/10 border-green-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  red: 'text-red-500 bg-red-500/10 border-red-500/20',
}

export default function CheckinPage() {
  const [levels, setLevels] = useState<Level[]>([])

  useEffect(() => {
    fetch('/api/levels')
      .then(res => res.json())
      .then(json => {
        if (json.success) setLevels(json.data)
      })
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">签到中心</h1>
          <p className="mt-2 text-muted-foreground">
            每日签到获取积分和经验，提升等级解锁更多特权
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧签到卡片 */}
          <div className="lg:col-span-2">
            <CheckinCard />
          </div>

          {/* 右侧等级说明 */}
          <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">等级特权</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {levels.map((level, index) => (
                  <div 
                    key={level.level}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${COLOR_MAP[level.color]}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                      {ICON_MAP[level.icon]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Lv.{level.level} {level.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {level.min_exp} 经验
                        </Badge>
                      </div>
                      <div className="mt-1 flex gap-2 text-xs">
                        <span>签到+{level.checkin_bonus}</span>
                        {level.lottery_discount > 0 && (
                          <span>抽奖-{level.lottery_discount}%</span>
                        )}
                      </div>
                    </div>
                    {index < levels.length - 1 && (
                      <ArrowRight className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 积分获取途径 */}
            <Card className="mt-4 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">积分获取</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">每日签到</span>
                  <span className="font-medium text-primary">+10~100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">连续签到奖励</span>
                  <span className="font-medium text-primary">+20~100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">提交中转站</span>
                  <span className="font-medium text-primary">+50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">抽奖中奖</span>
                  <span className="font-medium text-primary">+奖励积分</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
