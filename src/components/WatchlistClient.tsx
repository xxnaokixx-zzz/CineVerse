'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { FaTimes, FaHeart, FaRegHeart, FaTrash, FaCheck, FaCheckSquare, FaSquare } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  'Watched': 'bg-yellow-500',
  'Want to Watch': 'bg-blue-500',
  'To Watch': 'bg-blue-500',
  'Watching': 'bg-green-600',
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
  { label: '追加日（新しい順）', value: 'added_at_desc' },
  { label: '追加日（古い順）', value: 'added_at_asc' },
  { label: 'タイトル昇順（A→Z）', value: 'title_asc' },
  { label: 'タイトル降順（Z→A）', value: 'title_desc' },
];

const ANIMATION_GENRE_ID = 16;

// ステータス正規化関数を追加
const normalizeStatus = (status: string) => {
  if (!status) return '';
  const s = status.replace(/\s+/g, '').toLowerCase();
  if (s === 'wanttowatch') return 'towatch';
  return s;
};

// アイテムコンポーネント
function WatchlistItem({ item, onRemove, onStatusChange, favorites, STATUS_COLORS, STATUS_SELECT_OPTIONS, isDeleteMode, isSelected, onToggleSelection, onToggleFavorite }: any) {
  return (
    <div className="bg-darkgray rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group relative">
      {/* 削除モードのチェックボックス */}
      {isDeleteMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
          />
        </div>
      )}

      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          {!isDeleteMode && (
            <button
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <FaTimes className="text-white text-sm" />
            </button>
          )}
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
        {!isDeleteMode && (
          <div className="flex gap-2 items-center mt-2">
            <select
              className={`px-2 py-1 text-xs rounded-full text-white block flex-1 text-center focus:outline-none appearance-none ${STATUS_COLORS[item.status] || 'bg-gray-500'}`}
              value={item.status || 'Unselected'}
              onChange={e => onStatusChange(item.id, e.target.value)}
            >
              <option value="Unselected">ステータスを選択</option>
              {STATUS_SELECT_OPTIONS.filter((opt: { label: string; value: string }) => opt.value !== 'all' && opt.value !== 'Favorite').map((opt: { label: string; value: string }) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${favorites[item.id] ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {favorites[item.id] ? (
                <FaHeart className="text-white text-sm" />
              ) : (
                <FaRegHeart className="text-white text-sm" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 削除確認モーダルコンポーネント
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WatchlistClient({ items }: { items: any[] }) {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'all';
  const [status, setStatus] = useState('all');
  const didSetInitialStatus = useRef(false);

  useEffect(() => {
    if (!didSetInitialStatus.current) {
      setStatus(initialStatus);
      didSetInitialStatus.current = true;
    }
  }, [initialStatus]);

  const [watchlistItems, setWatchlistItems] = useState(items);
  const [filter, setFilter] = useState<'all' | 'watched' | 'to_watch' | 'watching' | 'favorite'>('all');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('added_at_desc');
  const [showCount, setShowCount] = useState(12);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map(item => [item.id, !!item.favorite]))
  );

  // 統計
  const total = watchlistItems.length;

  // デバッグ用に各アイテムのステータスを出力
  watchlistItems.forEach((item, index) => {
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
  const watched = watchlistItems.filter(item => normalizeStatus(item.status) === 'watched').length;
  const toWatch = watchlistItems.filter(item => normalizeStatus(item.status) === 'towatch').length;
  const watching = watchlistItems.filter(item => normalizeStatus(item.status) === 'watching').length;
  const favoriteCount = watchlistItems.filter(item => favorites[item.id]).length;

  console.log('Detailed status counts:', {
    total,
    watched: {
      count: watched,
      items: watchlistItems.filter(item => normalizeStatus(item.status) === 'watched').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    toWatch: {
      count: toWatch,
      items: watchlistItems.filter(item => normalizeStatus(item.status) === 'towatch').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    watching: {
      count: watching,
      items: watchlistItems.filter(item => normalizeStatus(item.status) === 'watching').map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    },
    favorite: {
      count: favoriteCount,
      items: watchlistItems.filter(item => favorites[item.id]).map(item => ({
        id: item.id,
        title: item.details?.title || item.details?.name
      }))
    }
  });

  const toggleFavorite = async (id: string) => {
    const newFavoriteValue = !favorites[id];
    setFavorites(f => ({ ...f, [id]: newFavoriteValue }));
    const supabase = createBrowserClient();
    await supabase.from('watchlist_items').update({ favorite: newFavoriteValue }).eq('id', id);
  };

  // フィルタリング
  let filtered = watchlistItems.filter(item => {
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
    setWatchlistItems(watchlistItems.filter(item => item.id !== id));
  };

  // ステータス変更ハンドラ
  const handleStatusChange = async (id: string, newStatus: string) => {
    const supabase = createBrowserClient();
    await supabase.from('watchlist_items').update({ status: newStatus }).eq('id', id);
    setWatchlistItems(prev => {
      const newList = prev.map(item => item.id === id ? { ...item, status: newStatus } : item);
      console.log('New list after status update:', newList.map(item => ({
        id: item.id,
        status: item.status,
        title: item.details?.title || item.details?.name
      })));
      return newList;
    });
  };

  // 削除モード関連の関数
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    const filteredIds = filtered.map(item => item.id);
    setSelectedItems(new Set(filteredIds));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const deleteSelected = () => {
    if (selectedItems.size === 0) return;

    setDeleteModal({
      isOpen: true,
      title: '選択したアイテムを削除',
      message: `${selectedItems.size}個のアイテムを削除しますか？この操作は取り消せません。`,
      onConfirm: async () => {
        const supabase = createBrowserClient();
        await supabase.from('watchlist_items').delete().in('id', Array.from(selectedItems));
        setWatchlistItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteAll = () => {
    setDeleteModal({
      isOpen: true,
      title: 'すべてのアイテムを削除',
      message: `ウォッチリストのすべてのアイテム（${filtered.length}個）を削除しますか？この操作は取り消せません。`,
      onConfirm: async () => {
        const supabase = createBrowserClient();
        await supabase.from('watchlist_items').delete().in('id', filtered.map(item => item.id));
        setWatchlistItems(prev => prev.filter(item => !filtered.some(f => f.id === item.id)));
        setSelectedItems(new Set());
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteSingleItem = (id: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'アイテムを削除',
      message: 'このアイテムを削除しますか？この操作は取り消せません。',
      onConfirm: async () => {
        const supabase = createBrowserClient();
        await supabase.from('watchlist_items').delete().eq('id', id);
        setWatchlistItems(prev => prev.filter(item => item.id !== id));
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 上部統計・フィルターUI */}
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        {/* 左カラム：統計ボタン */}
        <div className="flex gap-4 items-center">
          <button onClick={() => setStatus('all')} className={`text-center transition-colors ${status === 'all' ? 'text-primary' : 'text-primary'}`}>
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs">All</div>
          </button>
          <button onClick={() => setStatus('Watched')} className={`text-center transition-colors ${status === 'Watched' ? 'text-yellow-500' : 'text-yellow-500'}`}>
            <div className="text-2xl font-bold">{watched}</div>
            <div className="text-xs">Watched</div>
          </button>
          <button onClick={() => setStatus('Want to Watch')} className={`text-center transition-colors ${status === 'Want to Watch' ? 'text-blue-500' : 'text-blue-500'}`}>
            <div className="text-2xl font-bold">{toWatch}</div>
            <div className="text-xs">To Watch</div>
          </button>
          <button onClick={() => setStatus('Watching')} className={`text-center transition-colors ${status === 'Watching' ? 'text-green-600' : 'text-green-600'}`}>
            <div className="text-2xl font-bold">{watching}</div>
            <div className="text-xs">Watching</div>
          </button>
          <button onClick={() => setStatus('Favorite')} className={`text-center transition-colors ${status === 'Favorite' ? 'text-pink-500' : 'text-pink-500'}`}>
            <div className="text-2xl font-bold">{favoriteCount}</div>
            <div className="text-xs">Favorite</div>
          </button>
        </div>
        {/* 右カラム：ジャンル＋All/Date Added/削除モード */}
        <div className="flex gap-2 items-center">
          {CATEGORY_LABELS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${category === cat.value
                ? 'bg-primary text-white border-primary'
                : 'bg-darkgray text-gray-300 border-gray-600 hover:bg-primary/30'
                }`}
            >
              {cat.label}
            </button>
          ))}
          <select
            className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white appearance-none"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {STATUS_SELECT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white appearance-none"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={toggleDeleteMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap min-w-[110px] mr-0 ${isDeleteMode
              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
              : 'bg-darkgray text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
          >
            {isDeleteMode ? '削除モード終了' : '削除モード'}
          </button>
        </div>
      </div>

      {/* 削除モードのコントロール */}
      {isDeleteMode && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              すべて選択
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              選択解除
            </button>
            <button
              onClick={deleteSelected}
              disabled={selectedItems.size === 0}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              選択削除 ({selectedItems.size})
            </button>
            <button
              onClick={deleteAll}
              disabled={filtered.length === 0}
              className="px-3 py-1 bg-red-800 text-white rounded hover:bg-red-900 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              すべて削除 ({filtered.length})
            </button>
          </div>
        </div>
      )}

      {/* アイテムグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <WatchlistItem
            key={item.id + '-' + item.status}
            item={item}
            onRemove={deleteSingleItem}
            onStatusChange={handleStatusChange}
            favorites={favorites}
            STATUS_COLORS={STATUS_COLORS}
            STATUS_SELECT_OPTIONS={STATUS_SELECT_OPTIONS}
            isDeleteMode={isDeleteMode}
            isSelected={selectedItems.has(item.id)}
            onToggleSelection={() => toggleItemSelection(item.id)}
            onToggleFavorite={toggleFavorite}
          />
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

      {/* 削除確認モーダル */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
      />
    </div>
  );
} 