import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: DM一覧取得（相手ID指定で履歴も可）
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const otherId = searchParams.get('other_id');
  let query = supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at, read, sender:sender_id(avatar_url, first_name, last_name, email), receiver:receiver_id(avatar_url, first_name, last_name, email)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: true });
  if (otherId) {
    query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data });
}

// POST: DM送信
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { receiver_id, content } = body;
  if (!receiver_id || !content) {
    return NextResponse.json({ error: 'receiver_id and content are required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id,
      content,
    })
    .select('id, sender_id, receiver_id, content, created_at, read')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: data });
}

// PATCH: 既読フラグ更新
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { message_id, read } = body;
  if (!message_id || typeof read !== 'boolean') {
    return NextResponse.json({ error: 'message_id and read(boolean) are required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('messages')
    .update({ read })
    .eq('id', message_id)
    .eq('receiver_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 