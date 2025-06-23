import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import WatchlistClient from '@/components/WatchlistClient';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchMediaDetails(mediaType: string, mediaId: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}&language=ja`
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return <div className="text-center text-white py-12">ログインが必要です</div>;
  }
  const { data: items, error } = await supabase
    .from('watchlist_items')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });
  if (error) {
    return <div className="text-center text-red-400 py-12">データ取得エラー: {error.message}</div>;
  }

  // TMDb APIで詳細取得
  const detailedItems = await Promise.all(
    (items || []).map(async (item) => {
      const details = await fetchMediaDetails(item.media_type, item.media_id);
      return { ...item, details };
    })
  );

  // クライアント側で削除するためのJSX（use client）
  // 本来は分離するが、ここでは簡易的に下部に記載
  return (
    <div className="bg-dark text-white font-sans">
      <section className="bg-gradient-to-r from-primary/20 to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Watchlist</h1>
          <p className="text-gray-300">Track your favorite movies, anime, and TV shows</p>
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {(!detailedItems || detailedItems.length === 0) ? (
            <div className="text-center text-gray-400">ウォッチリストは空です</div>
          ) : (
            <WatchlistClient items={detailedItems} />
          )}
        </div>
      </section>
    </div>
  );
} 