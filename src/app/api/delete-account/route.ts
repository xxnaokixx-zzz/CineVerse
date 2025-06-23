import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { password } = await request.json()

    // 1. 現在のユーザー取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. パスワード再認証
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Password is incorrect.' }, { status: 401 })
    }

    // 3. サービスロールクライアントでユーザー削除
    const adminSupabase = createAdminClient()
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 