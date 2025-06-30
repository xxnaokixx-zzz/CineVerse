import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: コメント一覧取得（media_type, media_idで絞り込み）
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const media_type = searchParams.get('media_type');
  const media_id = searchParams.get('media_id');
  if (!media_type || !media_id) {
    return NextResponse.json({ error: 'media_type and media_id are required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, content, created_at, updated_at, profiles:user_id(avatar_url, first_name, last_name, email)')
    .eq('media_type', media_type)
    .eq('media_id', media_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase comments fetch error:', error);
    return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
  }
  return NextResponse.json({ comments: data });
}

// POST: コメント投稿
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { media_type, media_id, content } = body;
  if (!media_type || !media_id || !content) {
    return NextResponse.json({ error: 'media_type, media_id, and content are required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      media_type,
      media_id,
      content,
    })
    .select('id, user_id, content, created_at, updated_at')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comment: data });
}

// DELETE: コメント削除（自分のコメントのみ）
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { comment_id } = body;
  if (!comment_id) {
    return NextResponse.json({ error: 'comment_id is required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PATCH: コメント編集（自分のコメントのみ）
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { comment_id, content } = body;
  if (!comment_id || !content) {
    return NextResponse.json({ error: 'comment_id and content are required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', comment_id)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 