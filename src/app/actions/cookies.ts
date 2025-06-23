'use server'

import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function getCookie(name: string): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value ?? ''
}

export async function setCookie(
  name: string,
  value: string,
  options?: Partial<ResponseCookie>
): Promise<void> {
  const cookieStore = await cookies()
  await cookieStore.set({
    name,
    value,
    ...options,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })
}

export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies()
  await cookieStore.delete(name)
}
