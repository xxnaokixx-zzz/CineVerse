'use client';
import { useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  'Watched': 'bg-green-600',
  'Want to Watch': 'bg-yellow-500',
  'To Watch': 'bg-yellow-500',
  'Watching': 'bg-blue-500',
  'Dropped': 'bg-red-600',
};

const CATEGORY_LABELS = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'Anime', value: 'anime' },
  { label: 'Drama', value: 'tv' },
];

const STATUS_SELECT_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Watched', value: 'Watched' },
  { label: 'Want to Watch', value: 'Want to Watch' },
  { label: 'Watching', value: 'Watching' },
  { label: 'Favorite', value: 'Favorite' },
];

const SORT_OPTIONS = [
  { label: 'Date Added (Newest)', value: 'added_at_desc' },
  { label: 'Date Added (Oldest)', value: 'added_at_asc' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' },
];

const ANIMATION_GENRE_ID = 16;

// ステータス正規化関数を追加
const normalizeStatus = (status: string) => {
  if (!status) return '';
  const s = status.replace(/\s+/g, '').toLowerCase();
  if (s === 'wanttowatch') return 'towatch';
  return s;
};

export default function WatchlistClient({ items }: { items: any[] }) {
  const [list, setList] = useState(items);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('added_at_desc');
  const [showCount, setShowCount] = useState(12);
  const [favorites, setFavorites] = useState<{ [id: number]: boolean }>(
    Object.fromEntries(items.map(item => [item.id, !!item.favorite]))
  );

  // 統計
  const total = list.length;

  // デバッグ用に各アイテムのステータスを出力
  list.forEach((item, index) => {
    console.log(`Item ${index + 1} status check:`, {
      id: item.id,
      title: item.details?.title || item.details?.name,
      status: item.status,
      statusType: typeof item.status,
      rawStatus: JSON.stringify(item.status),
      favorite: favorites[item.id],
      rawFavorite: JSON.stringify(favorites[item.id])
    });
  });

  // ステータスのカウントを厳密に行う
  const watched = list.filter(item => normalizeStatus(item.status) === 'watched').length;
  const toWatch = list.filter(item => normalizeStatus(item.status) === 'towatch').length;
  const watching = list.filter(item => normalizeStatus(item.status) === 'watching').length;
  const favoriteCount = list.filter(item => favorites[item.id]).length;

  console.log('Detailed status counts:', {
    total,
    watched: {
      count: watched,
      items: list.filter(item => normalizeStatus(item.status) === 'watched').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    toWatch: {
      count: toWatch,
      items: list.filter(item => normalizeStatus(item.status) === 'towatch').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    watching: {
      count: watching,
      items: list.filter(item => normalizeStatus(item.status) === 'watching').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    favorite: {
      count: favoriteCount,
      items: list.filter(item => favorites[item.id]).map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    }
  });

  const toggleFavorite = async (id: number) => {
    const newValue = !favorites[id];
    setFavorites(f => ({ ...f, [id]: newValue }));
    const supabase = createBrowserClient();
    await supabase.from('watchlist_items').update({ favorite: newValue }).eq('id', id);
  };

  // フィルタリング
  let filtered = list.filter(item => {
    let catOk = true;
    if (category === 'anime') {
      catOk = item.media_type === 'tv' && Array.isArray(item.details?.genres) && item.details.genres.some((g: any) => g.id === ANIMATION_GENRE_ID);
    } else if (category === 'tv') {
      catOk = item.media_type === 'tv' && Array.isArray(item.details?.genres) && item.details.genres.length > 0 && !item.details.genres.some((g: any) => g.id === ANIMATION_GENRE_ID);
    } else if (category !== 'all') {
      catOk = item.media_type === category;
    }
    // ステータスフィルタがFavoriteのときはitem.favoriteを参照
    let statusOk = true;
    if (status === 'Favorite') {
      statusOk = !!favorites[item.id];
    } else if (status !== 'all') {
      statusOk = normalizeStatus(item.status) === normalizeStatus(status);
    }
    return catOk && statusOk;
  });

  // ソート
  filtered = filtered.sort((a, b) => {
    if (sort === 'added_at_desc') return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    if (sort === 'added_at_asc') return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
    if (sort === 'title_asc') return (a.details?.title || a.details?.name || '').localeCompare(b.details?.title || b.details?.name || '');
    if (sort === 'title_desc') return (b.details?.title || b.details?.name || '').localeCompare(a.details?.title || a.details?.name || '');
    return 0;
  });

  // ページネーション
  const visible = filtered.slice(0, showCount);

  const handleRemove = async (id: number) => {
    const supabase = createBrowserClient();
    await supabase.from('watchlist_items').delete().eq('id', id);
    setList(list.filter(item => item.id !== id));
  };

  // ステータス変更ハンドラ
  const handleStatusChange = async (id: number, newStatus: string) => {
    console.log('Status change requested:', { id, newStatus });
    if (newStatus === 'all') {
      // 何も変更しない
      return;
    }

    const supabase = createBrowserClient();

    if (newStatus === 'Favorite') {
      // 現在のステータスを維持したまま、favoriteだけを切り替える
      const newFavoriteValue = !favorites[id];
      console.log('Toggling favorite:', { id, newFavoriteValue });
      setFavorites(f => ({ ...f, [id]: newFavoriteValue }));
      await supabase.from('watchlist_items').update({ favorite: newFavoriteValue }).eq('id', id);
    } else {
      // 通常のステータス変更
      console.log('Updating status:', { id, newStatus });
      setList(prev => {
        const newList = prev.map(item => item.id === id ? { ...item, status: newStatus } : item);
        console.log('New list after status update:', newList.map(item => ({
          id: item.id,
          title: item.details?.title || item.details?.name,
          status: item.status
        })));
        return newList;
      });
      await supabase.from('watchlist_items').update({ status: newStatus }).eq('id', id);
    }
  };

  return (
    <div>
      {/* 上部統計・フィルターUI */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{total}</div>
            <div className="text-xs text-gray-400">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{watched}</div>
            <div className="text-xs text-gray-400">Watched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{toWatch}</div>
            <div className="text-xs text-gray-400">To Watch</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{watching}</div>
            <div className="text-xs text-gray-400">Watching</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-500">{favoriteCount}</div>
            <div className="text-xs text-gray-400">Favorite</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_LABELS.map(cat => (
            <button key={cat.value} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${category === cat.value ? 'bg-primary text-white border-primary' : 'bg-darkgray text-gray-300 border-gray-600 hover:bg-primary/30'}`} onClick={() => setCategory(cat.value)}>{cat.label}</button>
          ))}
          <select className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_SELECT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      {/* アイテムグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visible.map((item) => (
          <div key={item.id + '-' + item.status} className="bg-darkgray rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group relative">
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <button onClick={() => handleRemove(item.id)} className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
              <Link href={`/${item.media_type}/${item.media_id}`} className="block group">
                {item.details && item.details.poster_path ? (
                  <Image
                    className="w-full aspect-[2/3] object-cover"
                    src={`https://image.tmdb.org/t/p/w500${item.details.poster_path}`}
                    alt={item.details.title || item.details.name || ''}
                    width={500}
                    height={750}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-lightgray flex items-center justify-center text-gray-400">No Image</div>
                )}
              </Link>
            </div>
            <div className="p-4">
              <Link href={`/${item.media_type}/${item.media_id}`} className="block group">
                <h3 className="font-semibold mb-1 truncate hover:underline">{item.details ? (item.details.title || item.details.name) : item.media_id}</h3>
              </Link>
              <p className="text-gray-400 text-sm mb-2">
                {item.media_type === 'tv' && Array.isArray(item.details?.genres) && item.details.genres.some((g: any) => g.id === ANIMATION_GENRE_ID)
                  ? 'Anime'
                  : item.media_type === 'tv'
                    ? 'Drama'
                    : item.media_type}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>追加日: {item.added_at ? new Date(item.added_at).toLocaleDateString() : '-'}</span>
              </div>
              {/* ステータス選択とお気に入りボタンを横に並べる */}
              <div className="flex gap-2 items-center mt-2">
                <select
                  className={`px-2 py-1 text-xs rounded-full text-white block flex-1 text-center focus:outline-none ${STATUS_COLORS[item.status] || 'bg-gray-500'}`}
                  value={item.status || 'Unselected'}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                >
                  <option value="Unselected">ステータスを選択</option>
                  {STATUS_SELECT_OPTIONS.filter(opt => opt.value !== 'all' && opt.value !== 'Favorite').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleStatusChange(item.id, 'Favorite')}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${favorites[item.id] ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                >
                  {favorites[item.id] ? (
                    <FaHeart className="text-white text-sm" />
                  ) : (
                    <FaRegHeart className="text-white text-sm" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load Moreボタン */}
      {filtered.length > showCount && (
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition-colors" onClick={() => setShowCount(c => c + 12)}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
} 