export const dynamic = 'force-dynamic'; // SSR 強制

import { createClient } from '@/lib/supabase/server';
import AccountClient from './AccountClient';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const supabase = await createClient(); // ← await を忘れずに！

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const userId = user.id;

  const [
    watchlistResult,
    watchedResult,
    toWatchResult,
    watchingResult,
    favoritesResult,
    profileResult
  ] = await Promise.all([
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Watched'),

    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'To Watch'),

    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Watching'),

    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('favorite', true),

    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
  ]);

  const avatarUrl = profileResult.data?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(profileResult.data.avatar_url).data.publicUrl
    : null;

  // デバッグ用ログ
  console.log('profileResult:', profileResult.data);
  console.log('avatarUrl:', avatarUrl);

  return (
    <AccountClient
      user={user}
      avatarUrl={avatarUrl}
      counts={{
        watchlist: watchlistResult.count ?? 0,
        watched: watchedResult.count ?? 0,
        toWatch: toWatchResult.count ?? 0,
        watching: watchingResult.count ?? 0,
        favorites: favoritesResult.count ?? 0,
      }}
    />
  );
}
