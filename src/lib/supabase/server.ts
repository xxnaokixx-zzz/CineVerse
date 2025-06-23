import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

export async function createClient() {
  const cookies = await nextCookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set() { },
        remove() { },
      } as any
    }
  );
}
