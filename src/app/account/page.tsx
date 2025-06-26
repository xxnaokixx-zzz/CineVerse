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
      .in('status', ['To Watch', 'Want to Watch']),

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
      .select('avatar_url, first_name, last_name')
      .eq('id', userId)
      .single()
  ]);

  const avatarUrl = profileResult.data?.avatar_url
    ? profileResult.data.avatar_url.startsWith('http')
      ? profileResult.data.avatar_url
      : supabase.storage.from('avatars').getPublicUrl(profileResult.data.avatar_url).data.publicUrl
    : null;

  // デバッグ用ログ
  console.log('profileResult:', profileResult.data);
  console.log('avatarUrl:', avatarUrl);

  const firstName = profileResult.data?.first_name || '';
  const lastName = profileResult.data?.last_name || '';

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
      firstName={firstName}
      lastName={lastName}
    />
  );
}
