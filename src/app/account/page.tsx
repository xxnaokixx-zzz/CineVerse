import { createClient } from '@/lib/supabase/server';
import AccountClient from './AccountClient';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // --- Supabase集計 ---
  const userId = user.id;

  // 並列で全てのクエリを実行
  const [
    watchlistResult,
    watchedResult,
    toWatchResult,
    watchingResult,
    favoritesResult,
    profileResult
  ] = await Promise.all([
    // Watchlist Items (Total)
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    // Watched Items
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Watched'),

    // To Watch Items
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'To Watch'),

    // Watching Items
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Watching'),

    // Favorites Count
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('favorite', true),

    // Get avatar URL
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
  ]);

  const avatarUrl = profileResult.data?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(profileResult.data.avatar_url).data.publicUrl
    : null;

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