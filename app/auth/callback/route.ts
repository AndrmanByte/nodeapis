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
      // 如果要访问管理后台，需要验证管理员身份
      if (next.startsWith('/zjf')) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: admin } = await supabase
            .from('admins')
            .select('id')
            .eq('email', user.email)
            .single()

          if (!admin) {
            await supabase.auth.signOut()
            return NextResponse.redirect(`${origin}/zjf?error=unauthorized`)
          }
        }
      }

      // 普通用户或管理员验证通过，正常跳转
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 认证失败，重定向到首页
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
