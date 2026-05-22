import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: '名称和描述不能为空' },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI 服务未配置' },
        { status: 500 }
      )
    }

    const prompt = `你是一个专业的服务描述优化助手。请根据以下中转站信息，生成一段结构化的详细描述。

中转站名称：${name}
用户原始描述：${description}

请按照以下格式输出（不要输出其他内容，直接输出优化后的描述）：

【${name}是什么】
用2-3句话简洁介绍这个中转站的核心定位和主要价值。

【${name}能做什么】
列出3-5个核心功能或优势，每条一行，用简洁的语言描述。

【常见问题】
列出2-3个用户最可能关心的问题及简短回答。

要求：
- 语言简洁专业，不要过度营销
- 保留用户原始描述中的关键信息
- 适合展示在产品详情页`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('DeepSeek API error:', error)
      return NextResponse.json(
        { success: false, error: 'AI 服务调用失败' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const optimized = data.choices?.[0]?.message?.content

    if (!optimized) {
      return NextResponse.json(
        { success: false, error: 'AI 未返回有效内容' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: optimized })
  } catch (error) {
    console.error('AI optimize error:', error)
    return NextResponse.json(
      { success: false, error: 'AI 优化失败' },
      { status: 500 }
    )
  }
}
