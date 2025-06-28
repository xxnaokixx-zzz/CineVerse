'use client'

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // セッションの初期化を確実に行う
  const initializeSession = async () => {
    try {
      const { data: { session }, error } = await client.auth.getSession()
      if (error) {
        console.error('Session initialization error:', error)
        return null
      }
      return session
    } catch (error) {
      console.error('Session initialization failed:', error)
      return null
    }
  }

  // 初期化を実行
  initializeSession()

  return client
} 