import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, value, options } = await request.json();
    const response = NextResponse.json({ success: true });

    // Convert options to cookie string
    let cookieValue = `${name}=${value}; Path=/; SameSite=Lax`;
    if (options?.maxAge) cookieValue += `; Max-Age=${options.maxAge}`;
    if (options?.secure) cookieValue += '; Secure';
    if (options?.httpOnly) cookieValue += '; HttpOnly';

    response.headers.set('Set-Cookie', cookieValue);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set cookie' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', `${name}=; Path=/; Max-Age=0; SameSite=Lax`);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cookie' }, { status: 500 });
  }
} 