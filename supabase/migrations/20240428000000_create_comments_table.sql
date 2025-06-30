-- コメントテーブル作成
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    media_type TEXT NOT NULL, -- 'movie' or 'anime'
    media_id TEXT NOT NULL,   -- TMDBや独自ID
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS有効化
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- コメント閲覧は全員可
CREATE POLICY "Public can view comments"
ON public.comments FOR SELECT
TO public
USING (true);

-- 自分のコメントのみ投稿・編集・削除可
CREATE POLICY "Users can insert their own comment"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comment"
ON public.comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comment"
ON public.comments FOR DELETE
TO authenticated
USING (user_id = auth.uid()); 