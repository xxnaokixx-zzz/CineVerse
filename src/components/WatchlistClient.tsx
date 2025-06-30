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
  { label: '追加日 | 新しい順', value: 'added_at_desc' },
  { label: '追加日 | 古い順', value: 'added_at_asc' },
  { label: 'タイトル | 昇順', value: 'title_asc' },
  { label: 'タイトル | 降順', value: 'title_desc' },
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
      {isDeleteMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="appearance-none w-5 h-5 text-red-600 bg-gray-100 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:ring-offset-0 checked:bg-red-600 checked:border-red-600 transition-colors cursor-pointer"
          />
        </div>
      )}
      <div className="relative">
        <Link href={`/${item.media_type}/${item.media_id}`} className="block group">
          {item.details && item.details.poster_path ? (
            <Image className="w-full aspect-[2/3] object-cover" src={`https://image.tmdb.org/t/p/w500${item.details.poster_path}`} alt={item.details.title || item.details.name || ''} width={500} height={750} />
          ) : (
            <div className="w-full aspect-[2/3] bg-lightgray flex items-center justify-center text-gray-400">No Image</div>
          )}
        </Link>
      </div>
      <div className="p-4 relative">
        <Link href={`/${item.media_type}/${item.media_id}`} className="block group">
          <h3 className="font-semibold mb-2 truncate hover:underline">{item.details ? (item.details.title || item.details.name) : item.media_id}</h3>
        </Link>
        <p className="text-gray-400 text-sm">
          {item.media_type === 'tv' && Array.isArray(item.details?.genres) && item.details.genres.some((g: any) => g.id === 16) ? 'Anime' : item.media_type === 'tv' ? 'Drama' : item.media_type}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <span>追加日: {item.added_at ? new Date(item.added_at).toLocaleDateString() : '-'}</span>
        </div>
        {!isDeleteMode && (
          <>
            <div className="pr-10">
              <select className={`h-8 px-2 text-xs rounded-full text-white block w-full text-center focus:outline-none appearance-none ${STATUS_COLORS[item.status] || 'bg-gray-500'}`} value={item.status || 'Unselected'} onChange={e => onStatusChange(item.id, e.target.value)}>
                <option value="Unselected">ステータスを選択</option>
                {STATUS_SELECT_OPTIONS.filter((opt: { value: string; }) => opt.value !== 'all' && opt.value !== 'Favorite').map((opt: { label: string; value: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={() => onToggleFavorite(item.id)} className={`absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${favorites[item.id] ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
              {favorites[item.id] ? <FaHeart className="text-white text-sm" /> : <FaRegHeart className="text-white text-sm" />}
            </button>
          </>
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
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('added_at_desc');
  const [yearFilter, setYearFilter] = useState('all');
  const [showCount, setShowCount] = useState(12);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(Object.fromEntries(items.map(item => [item.id, !!item.favorite])));

  const total = watchlistItems.length;
  const watched = watchlistItems.filter(item => normalizeStatus(item.status) === 'watched').length;
  const toWatch = watchlistItems.filter(item => normalizeStatus(item.status) === 'towatch').length;
  const watching = watchlistItems.filter(item => normalizeStatus(item.status) === 'watching').length;
  const favoriteCount = watchlistItems.filter(item => favorites[item.id]).length;

  const availableYears = ['all', ...Array.from(new Set(items.map(item => item.added_at ? new Date(item.added_at).getFullYear() : null).filter((year): year is number => year !== null))).sort((a, b) => b - a)];

  const filteredAndSortedItems = watchlistItems
    .filter(item => {
      let catOk = true;
      if (category === 'anime') {
        catOk = item.media_type === 'tv' && Array.isArray(item.details?.genres) && item.details.genres.some((g: any) => g.id === ANIMATION_GENRE_ID);
      } else if (category === 'tv') {
        catOk = item.media_type === 'tv' && Array.isArray(item.details?.genres) && !item.details.genres.some((g: any) => g.id === ANIMATION_GENRE_ID);
      } else if (category !== 'all') {
        catOk = item.media_type === category;
      }

      const statusOk = status === 'all' || (status === 'Favorite' ? !!favorites[item.id] : normalizeStatus(item.status) === normalizeStatus(status));

      const itemYear = item.added_at ? new Date(item.added_at).getFullYear() : null;
      const yearOk = yearFilter === 'all' || (itemYear !== null && itemYear.toString() === yearFilter);

      return catOk && statusOk && yearOk;
    })
    .sort((a, b) => {
      if (sort === 'added_at_desc') return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      if (sort === 'added_at_asc') return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      if (sort === 'title_asc') return (a.details?.title || a.details?.name || '').localeCompare(b.details?.title || b.details?.name || '');
      if (sort === 'title_desc') return (b.details?.title || b.details?.name || '').localeCompare(a.details?.title || a.details?.name || '');
      return 0;
    });

  const displayedItems = filteredAndSortedItems.slice(0, showCount);

  const toggleFavorite = async (id: string) => {
    const newFavoriteValue = !favorites[id];
    setFavorites(f => ({ ...f, [id]: newFavoriteValue }));
    const supabase = createBrowserClient();
    await supabase.from('watchlist_items').update({ favorite: newFavoriteValue }).eq('id', id);
  };

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
    const filteredIds = filteredAndSortedItems.map(item => item.id);
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
      title: '表示中のアイテムをすべて削除',
      message: `表示中のすべてのアイテム（${filteredAndSortedItems.length}個）を削除しますか？この操作は取り消せません。`,
      onConfirm: async () => {
        const supabase = createBrowserClient();
        await supabase.from('watchlist_items').delete().in('id', filteredAndSortedItems.map(item => item.id));
        setWatchlistItems(prev => prev.filter(item => !filteredAndSortedItems.some(f => f.id === item.id)));
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

  const loadMore = () => {
    setShowCount(prev => prev + 12);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button onClick={() => setStatus('all')} className={`text-center transition-colors ${status === 'all' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
            <div className={status === 'all' ? 'animate-bounce-y' : ''}>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs">All</div>
            </div>
          </button>
          <div className="border-l border-gray-600 h-10"></div>
          <button onClick={() => setStatus('Want to Watch')} className={`text-center transition-colors ${status === 'Want to Watch' ? 'text-blue-500' : 'text-blue-500/70 hover:text-blue-500'}`}>
            <div className={status === 'Want to Watch' ? 'animate-bounce-y' : ''}>
              <div className="text-2xl font-bold">{toWatch}</div>
              <div className="text-xs">To Watch</div>
            </div>
          </button>
          <button onClick={() => setStatus('Watching')} className={`text-center transition-colors ${status === 'Watching' ? 'text-green-600' : 'text-green-600/70 hover:text-green-600'}`}>
            <div className={status === 'Watching' ? 'animate-bounce-y' : ''}>
              <div className="text-2xl font-bold">{watching}</div>
              <div className="text-xs">Watching</div>
            </div>
          </button>
          <button onClick={() => setStatus('Watched')} className={`text-center transition-colors ${status === 'Watched' ? 'text-yellow-500' : 'text-yellow-500/70 hover:text-yellow-500'}`}>
            <div className={status === 'Watched' ? 'animate-bounce-y' : ''}>
              <div className="text-2xl font-bold">{watched}</div>
              <div className="text-xs">Watched</div>
            </div>
          </button>
          <div className="border-l border-gray-600 h-10"></div>
          <button onClick={() => setStatus('Favorite')} className={`text-center transition-colors ${status === 'Favorite' ? 'text-pink-500' : 'text-pink-500/70 hover:text-pink-500'}`}>
            <div className={status === 'Favorite' ? 'animate-bounce-y' : ''}>
              <div className="text-2xl font-bold">{favoriteCount}</div>
              <div className="text-xs">Favorite</div>
            </div>
          </button>
        </div>
        <div className="flex gap-2 items-center">
          {CATEGORY_LABELS.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${category === cat.value ? 'bg-primary text-white border-primary' : 'bg-darkgray text-gray-300 border-gray-600 hover:bg-primary/30'}`}>
              {cat.label}
            </button>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-darkgray border border-gray-600 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
            {availableYears.map(year => {
              const now = new Date().getFullYear();
              let displayYear;
              if (year === 'all') displayYear = 'すべての年';
              else if (year === now) displayYear = '今年';
              else if (year === now - 1) displayYear = '去年';
              else if (year === now - 2) displayYear = '一昨年';
              else displayYear = `${year}年`;
              return <option key={year} value={year.toString()}>{displayYear}</option>;
            })}
          </select>
          <button onClick={toggleDeleteMode} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap min-w-[110px] ${isDeleteMode ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-darkgray text-gray-300 border-gray-600 hover:bg-gray-700'}`}>
            {isDeleteMode ? '削除モード終了' : '削除モード'}
          </button>
        </div>
      </div>

      {isDeleteMode && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <button onClick={selectAll} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">すべて選択</button>
            <button onClick={deselectAll} className="px-3 py-1 bg-gray-600 text-white rounded-full hover:bg-gray-700">選択解除</button>
            <button onClick={deleteSelected} disabled={selectedItems.size === 0} className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
              選択削除 ({selectedItems.size})
            </button>
            <button onClick={deleteAll} disabled={filteredAndSortedItems.length === 0} className="px-3 py-1 bg-red-800 text-white rounded-full hover:bg-red-900 disabled:bg-gray-600 disabled:cursor-not-allowed">
              すべて削除 ({filteredAndSortedItems.length})
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedItems.map(item => (
          <WatchlistItem
            key={item.id}
            item={item}
            onRemove={handleRemove}
            onStatusChange={handleStatusChange}
            favorites={favorites}
            STATUS_COLORS={STATUS_COLORS}
            STATUS_SELECT_OPTIONS={STATUS_SELECT_OPTIONS}
            isDeleteMode={isDeleteMode}
            isSelected={selectedItems.has(item.id)}
            onToggleSelection={() => toggleItemSelection(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        {showCount < filteredAndSortedItems.length && (
          <button onClick={loadMore} className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition-colors">Load More</button>
        )}
      </div>
      <DeleteConfirmationModal {...deleteModal} onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
} 