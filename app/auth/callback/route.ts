import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 验证用户是否为管理员
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 检查用户是否在管理员列表中
        const { data: admin } = await supabase
          .from('admins')
          .select('id')
          .eq('email', user.email)
          .single()

        if (admin || next !== '/zjf/dashboard') {
          return NextResponse.redirect(`${origin}${next}`)
        } else {
          // 不是管理员，登出并重定向到错误页
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/zjf?error=unauthorized`)
        }
      }
    }
  }

  // 认证失败，重定向到登录页
  return NextResponse.redirect(`${origin}/zjf?error=auth_failed`)
}
