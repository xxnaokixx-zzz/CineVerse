'use client';

import { useState } from 'react';
import { SearchHistoryItem } from '@/lib/hooks/useSearchHistory';
import { FiClock, FiX, FiTrash2, FiUser } from 'react-icons/fi';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { getImageUrl } from '@/services/movieService';
import { useRouter } from 'next/navigation';

interface SearchHistoryListProps {
  searchHistory: SearchHistoryItem[];
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
  isVisible: boolean;
}

export default function SearchHistoryList({
  searchHistory,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
  isVisible,
}: SearchHistoryListProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  if (!isVisible || searchHistory.length === 0) {
    return null;
  }

  // officialTitle重複排除
  const uniqueHistory = searchHistory.filter((item, idx, arr) => {
    if (!item.officialTitle) return true;
    return arr.findIndex(x => x.officialTitle === item.officialTitle) === idx;
  });

  // ページネーション
  const totalPages = Math.ceil(uniqueHistory.length / PAGE_SIZE);
  const pagedHistory = uniqueHistory.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };
  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleHistoryCardClick = (item: SearchHistoryItem) => {
    onSelectHistory(item.query);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        {uniqueHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <FiTrash2 size={16} />
            <span>全削除</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
        {pagedHistory.map((item) => (
          <div key={item.query} className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHistory(item.query);
              }}
              className="absolute top-2 right-2 z-10 p-1 bg-black/60 rounded-full text-gray-400 hover:text-red-500 transition-all"
              title="削除"
            >
              <FiX size={16} />
            </button>
            {item.personId && item.personName ? (
              <Link href={`/person/${item.personId}`}>
                <div className="cursor-pointer">
                  <div className="relative bg-darkgray rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="aspect-[2/3] bg-lightgray flex items-center justify-center">
                      {item.profilePath ? (
                        <img
                          src={getImageUrl(item.profilePath)}
                          alt={item.personName}
                          className="w-full h-full object-cover"
                        />
                      ) : item.personKnownFor && item.personKnownFor[0]?.posterPath ? (
                        <img
                          src={getImageUrl(item.personKnownFor[0].posterPath)}
                          alt={item.personKnownFor[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-6xl text-gray-500" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1">
                        {item.personName}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {item.personDepartment}
                      </p>
                      {item.personKnownFor && item.personKnownFor.length > 0 && (
                        <div className="text-xs text-gray-500">
                          代表作: {item.personKnownFor.slice(0, 2).map(work => work.title).join(', ')}
                          {item.personKnownFor.length > 2 ? ' ...' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                onClick={() => {
                  if (item.id && item.mediaType) {
                    router.push(`/${item.mediaType}/${item.id}`);
                  } else {
                    onSelectHistory(item.query);
                  }
                }}
                className="cursor-pointer"
              >
                <MovieCard
                  id={item.id || 0}
                  title={item.officialTitle || item.query}
                  imageUrl={item.imageUrl || ''}
                  rating={item.rating || ''}
                  year={item.year || ''}
                  mediaType={(item.mediaType as 'movie' | 'tv') || 'movie'}
                />
                {(Array.isArray(item.cast) && item.cast.length > 0) || (Array.isArray(item.crew) && item.crew.length > 0) ? (
                  <div className="mt-2 text-xs text-gray-400">
                    {Array.isArray(item.cast) && item.cast.length > 0 && (
                      <div>キャスト: {item.cast.slice(0, 3).join(', ')}{item.cast.length > 3 ? ' ...' : ''}</div>
                    )}
                    {Array.isArray(item.crew) && item.crew.length > 0 && (
                      <div>スタッフ: {item.crew.slice(0, 2).join(', ')}{item.crew.length > 2 ? ' ...' : ''}</div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* ページ送りボタン */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >前へ</button>
          <span className="text-white">{page + 1} / {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={page === totalPages - 1}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >次へ</button>
        </div>
      )}
    </div>
  );
} 