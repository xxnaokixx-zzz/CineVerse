import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('=== MIDDLEWARE START ===')
  console.log('Middleware executing for path:', pathname)
  console.log('User-Agent:', request.headers.get('user-agent'))
  console.log('Host:', request.headers.get('host'))

  // ログイン・サインアップ・認証コールバックは除外
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/signup-success') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    console.log('Path excluded from auth check:', pathname)
    console.log('=== MIDDLEWARE END (EXCLUDED) ===')
    return NextResponse.next()
  }

  console.log('Checking authentication for path:', pathname)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 環境変数の確認
  console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value
          console.log(`Getting cookie ${name}:`, !!cookie)
          return cookie
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`Setting cookie ${name}`)
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
          })
        },
        remove(name: string, options: CookieOptions) {
          console.log(`Removing cookie ${name}`)
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            path: '/'
          })
        },
      },
    }
  )

  try {
    console.log('Attempting to get session...')
    const { data: { session }, error } = await supabase.auth.getSession()

    console.log('Session check result:', {
      hasSession: !!session,
      error: error?.message,
      sessionExpiresAt: session?.expires_at,
      currentTime: new Date().toISOString()
    })

    // Handle specific refresh token errors
    if (error && error.message.includes('refresh_token_not_found')) {
      console.log('Refresh token not found, clearing cookies and redirecting to login')

      // Clear all auth-related cookies
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      ]

      cookiesToClear.forEach(cookieName => {
        response.cookies.set({
          name: cookieName,
          value: '',
          maxAge: 0,
          path: '/',
          sameSite: 'lax',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        })
      })

      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      redirectUrl.searchParams.set('session_expired', 'true')
      console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN - REFRESH TOKEN) ===')
      return NextResponse.redirect(redirectUrl)
    }

    if (error) {
      console.error('Auth error:', error)
      // エラーが発生した場合はログインにリダイレクト
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      redirectUrl.searchParams.set('session_expired', 'true')
      console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN - AUTH ERROR) ===')
      return NextResponse.redirect(redirectUrl)
    }

    // セッションが存在しない場合はログインページにリダイレクト
    if (!session) {
      console.log('No session found, redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN - NO SESSION) ===')
      return NextResponse.redirect(redirectUrl)
    }

    // セッションが有効期限切れの場合はログインページにリダイレクト
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      console.log('Session expired, redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      redirectUrl.searchParams.set('session_expired', 'true')
      console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN - SESSION EXPIRED) ===')
      return NextResponse.redirect(redirectUrl)
    }

    console.log('Authentication successful, proceeding to page')
    console.log('=== MIDDLEWARE END (SUCCESS) ===')
    return response
  } catch (error) {
    console.error('Middleware error:', error)

    // Clear cookies on any auth error
    const response = NextResponse.redirect(new URL('/login', request.url))

    // Clear all potential auth cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      })
    })

    console.log('=== MIDDLEWARE END (REDIRECT TO LOGIN - EXCEPTION) ===')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}