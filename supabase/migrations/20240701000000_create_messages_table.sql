-- DMメッセージテーブル作成
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read BOOLEAN DEFAULT FALSE
);

-- RLS有効化
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 送信者・受信者のみ閲覧可
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 送信者のみ送信可
CREATE POLICY "Users can send messages as sender"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- 受信者のみ既読更新可
CREATE POLICY "Receiver can update read flag"
ON public.messages FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid());

-- 送信者・受信者のみ削除可
CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid()); 